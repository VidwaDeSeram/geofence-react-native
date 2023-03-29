import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import { smallerGeofences, mainGeofence, checkLocationInGeofences } from './geofences';
import { askPermissions, registerBackgroundLocationTask, requestNotificationPermissions, showNotification, createNotificationChannel } from './permissions';
import styles from './styles';


export default function App() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 6.821218837130938,
    longitude: 80.03738984759521,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [insideMainGeofence, setInsideMainGeofence] = useState(false);
  const [currentGeofence, setCurrentGeofence] = useState(null);

  useEffect(() => {
    let watchId;
    (async () => {
      if (await askPermissions()) {
        await registerBackgroundLocationTask();
      }
    })();

    const getLocationAsync = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 20,
        },
        (newLocation) => {
          setLocation(newLocation);
          checkLocation(newLocation.coords);
        }
      );
    };

    requestNotificationPermissions();
    getLocationAsync();

    return () => {
      if (watchId) {
        Location.removeWatchAsync(watchId);
      }
    };
  }, []);

  const checkLocation = async (coords) => {
    const { insideMain, geofenceName } = checkLocationInGeofences(coords, smallerGeofences, mainGeofence);

    if (insideMain && geofenceName && geofenceName !== currentGeofence) {
      const channelId = await createNotificationChannel();
      showNotification('Geofence Alert', `You are now inside the ${geofenceName} geofence.`, channelId);
    }

    setInsideMainGeofence(insideMain);
    setCurrentGeofence(geofenceName);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        <Polygon coordinates={mainGeofence.coordinates} />
        {smallerGeofences.map((geofence) => (
          <Polygon key={geofence.id} coordinates={geofence.coordinates} />
        ))}
        {location ? (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        ) : null}
      </MapView>
      {insideMainGeofence && (
        <View style={styles.notificationPanel}>
          <Text style={styles.notificationTitle}>
            Notification Panel
          </Text>
          <Text style={styles.status}>
            Small Geofence Status: {currentGeofence ? currentGeofence : 'Outside'}
          </Text>
        </View>
      )}
    </View>
  );
}

