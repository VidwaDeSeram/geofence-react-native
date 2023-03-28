import * as geolib from 'geolib';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { smallerGeofences, mainGeofence, checkLocationInGeofences } from './geofenceModel';

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
    const getLocationAsync = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
          setRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          checkLocation(newLocation.coords);
        }
      );
    };

    getLocationAsync();

    return () => {
      if (watchId) {
        Location.removeWatchAsync(watchId);
      }
    };
  }, []);

  const checkLocation = (coords) => {
    const { insideMain, geofenceName } = checkLocationInGeofences(coords, smallerGeofences, mainGeofence);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  notificationPanel: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderColor: '#999',
    borderWidth: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
  },
});    
