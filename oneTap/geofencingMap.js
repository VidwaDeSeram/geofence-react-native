import React from "react";
import MapView, { Polygon } from "react-native-maps";
import { geofences } from "./geofenceModel";

const GeofencingMap = () => {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 6.82082657142907,
        longitude: 80.0382640094262,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {geofences.map((geofences) => (
        <Polygon
          key={geofences.id}
          coordinates={geofences.coordinates.geometry.coordinates[0].map(
            ([lng, lat]) => ({ latitude: lat, longitude: lng })
          )}
          strokeColor="#000"
          fillColor="rgba(255,0,0,0.2)"
        />
      ))}
    </MapView>
  );
};

export default GeofencingMap;
