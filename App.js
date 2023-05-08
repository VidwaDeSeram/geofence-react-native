import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as turf from "@turf/turf";
import axios from "axios";
import { DateTime } from "luxon";

import GeofencingMap from "./geofencingMap";
import { requestLocationPermission } from "./locationPermission";
import { isPointInGeofence } from "./geofenceModel";

let currentGeofence = null;
let isProcessRunning = false;
let lectureDetailsArray;

const lectureDetailsByUserID = async () => {
  try {
    const response = await axios.get(
      "http://192.168.8.132:3000/api/time/lectureDetailsByUserID",
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NDU3ZDQ5NzhjZjM4NzBiYzJmMDY5ZSIsImlhdCI6MTY4MjI3NTY5MSwiZXhwIjoxNjg0ODY3NjkxfQ.aA54KC8rxkkpjAfaTvykagR9ayPlZYIQh414J17VaF8`,
        },
      }
    );

    lectureDetailsArray = response.data;
    console.log("received");
  } catch (error) {
    console.error("Error fetching lecture details:", error);
  }
};
const getCurrentSriLankanTime = () => {
  const timeZone = "Asia/Colombo";
  const sriLankanTime = DateTime.now().setZone(timeZone);
  const formattedTime = sriLankanTime.toFormat("yyyy-MM-dd'T'HH:mm:ss");

  return formattedTime;
};

const geofenceTimer = async (lectureDetails) => {
  let timer = null;
  let elapsedTime = 0;

  const makeHTTPRequest = async (lectureID) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/attendance/add",
        {
          lectureID: lectureID,
        },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NDU3ZDQ5NzhjZjM4NzBiYzJmMDY5ZSIsImlhdCI6MTY4MjI3NTY5MSwiZXhwIjoxNjg0ODY3NjkxfQ.aA54KC8rxkkpjAfaTvykagR9ayPlZYIQh414J17VaF8`,
          },
        }
      );

      console.log("Sent111111111111111111111111111111111111111111111");
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const checkGeofenceAndSendRequest = () => {
    const currentTime = getCurrentSriLankanTime();

    if (currentGeofence && geofenceID === currentGeofence.id) {
      if (timer === null) {
        timer = setInterval(() => (elapsedTime += 1000), 1000);
      }
    } else if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }

    if (currentTime >= endTime) {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }

      if (elapsedTime >= duration * 0.75) {
        makeHTTPRequest(_id);
      }
    } else {
      setTimeout(checkGeofenceAndSendRequest, 1000);
    }
  };

  const startTimer = () => {
    const currentTime = getCurrentSriLankanTime();

    if (currentTime >= startTime && currentTime <= endTime) {
      checkGeofenceAndSendRequest();
    } else if (currentTime < startTime) {
      const timeUntilStart = new Date(startTime) - currentTime;
      setTimeout(startTimer, timeUntilStart);
    }
  };

  if (lectureDetails) {
    startTimer();
  }

  // You can use this function to stop the timer when you want
  const stopTimer = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  return { stopTimer };
};

const processMultipleLectureDetails = async () => {
  if (isProcessRunning) {
    return;
  }
  isProcessRunning = true;
  console.log("processMultipleLectureDetails");
  for (const lectureDetail of lectureDetailsArray) {
    await geofenceTimer(lectureDetail);
  }

  isProcessRunning = false;
};
const LOCATION_UPDATE_TASK = "locationUpdates";

TaskManager.defineTask(
  LOCATION_UPDATE_TASK,
  async ({ data: { locations } }) => {
    try {
      const location = locations[0];
      if (location) {
        const point = turf.point([
          location.coords.longitude,
          location.coords.latitude,
        ]);
        const geofence = isPointInGeofence(point);
        currentGeofence = geofence;
        if (geofence) {
          await processMultipleLectureDetails();

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
      await lectureDetailsByUserID();
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
