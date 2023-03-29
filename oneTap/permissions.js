import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { smallerGeofences, mainGeofence, checkLocationInGeofences } from './geofences';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

export const createNotificationChannel = async () => {
    if (Platform.OS === 'android') {
        const channelId = 'geofence-alerts';
        const channel = await Notifications.getNotificationChannelAsync(channelId);
        if (!channel) {
            await Notifications.setNotificationChannelAsync(channelId, {
                name: 'Geofence Alerts',
                importance: Notifications.AndroidImportance.HIGH,
                sound: true,
                vibration: true,
                enableVibrate: true,
            });
        }
        return channelId;
    }
    return null;
};


export const askPermissions = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();

    if (status !== 'granted') {
        alert('Permission to access background location was denied');
        return false;
    }

    return true;
};

export const registerBackgroundLocationTask = async () => {
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 20,
        pausesUpdatesAutomatically: false,
        foregroundService: {
            notificationTitle: 'Location tracking',
            notificationBody: 'Your location is being tracked in the background',
            notificationColor: '#00BFFF',
        },
    });

    TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data: { locations }, error }) => {
        if (error) {
            console.error('Background location task error:', error);
            return;
        }

        const { coords } = locations[0];
        const { insideMain, geofenceName } = checkLocationInGeofences(coords, smallerGeofences, mainGeofence);

        if (insideMain && geofenceName) {
            await showNotification('Geofence Alert', `You are now inside the ${geofenceName} geofence.`);
        }
    });
};


export const requestNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync({ android: {} });
        if (newStatus !== 'granted') {
            console.warn('Notification permission not granted');
        }
    }
};

export const showNotification = async (title, body, channelId) => {
    await Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            channelId: channelId,
        },
        trigger: {
            seconds: 1, // Schedule the notification to be displayed after 1 second
        },
    });
};

