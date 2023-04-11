import * as Location from 'expo-location';


export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    return false;
  }

  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

  if (bgStatus !== 'granted') {
    return false;
  }

  return true;
};
