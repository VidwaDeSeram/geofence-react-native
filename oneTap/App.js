import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import GeofencingMap from "./geofencingMap";
import { requestLocationPermission } from "./locationPermission";
import { isPointInGeofence } from "./geofenceController";
import * as turf from "@turf/turf";

const LOCATION_UPDATE_TASK = "locationUpdates";

TaskManager.defineTask(
  LOCATION_UPDATE_TASK,
  async ({ data: { locations } }) => {
    try {
      console.log("test4");
      const location = locations[0];
      console.log(`hbuasyhbfd${location}`);
      if (location) {
        const point = turf.point([
          location.coords.longitude,
          location.coords.latitude,
        ]);
        console.log("test1");
        const geofence = isPointInGeofence(point);
        console.log(geofence);
        if (geofence) {
          console.log("test2");
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Geofence Alert",
              body: `You entered ${geofence.name}`,
            },
            trigger: null,
          });
        }
      }
      return "new-data";
    } catch (error) {
      console.error(error);
      return "failed";
    }
  }
);

export default function App() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return;
      }
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        LOCATION_UPDATE_TASK
      );
      if (!isRegistered) {
        await Location.requestBackgroundPermissionsAsync();
        await Location.startLocationUpdatesAsync(LOCATION_UPDATE_TASK, {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Geofence monitoring",
            notificationBody: "Background location tracking is active",
          },
          pausesUpdatesAutomatically: false,
        });
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
        },
        (locationUpdate) => {
          setLocation(locationUpdate);
        }
      );

      return () => {
        subscription.remove();
      };
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <GeofencingMap />
      {location && (
        <Text>
          Current Location: {location.coords.latitude},{" "}
          {location.coords.longitude}
        </Text>
      )}
    </View>
  );
}
