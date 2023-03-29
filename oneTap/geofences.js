import * as geolib from 'geolib';

export const mainGeofence = {
    id: 0,
    name: 'Campus',
    coordinates: [
        { latitude: 6.821220728569246, longitude: 80.0374808046019 },
        { latitude: 6.822828377049714, longitude: 80.04109955654077 },
        { latitude: 6.819927348295379, longitude: 80.04233707953745 },
        { latitude: 6.8197850924638805, longitude: 80.0419102296836 },
        { latitude: 6.820483484121349, longitude: 80.04147568367067 },
        { latitude: 6.819391003602002, longitude: 80.03941454155513 },
    ],
};

export const smallerGeofences = [
    {
        id: 1,
        name: 'Faculty of Management',
        coordinates: [
            { latitude: 6.82082657142907, longitude: 80.0382640094262 },
            { latitude: 6.820932164888255, longitude: 80.03853536475592 },
            { latitude: 6.820971333456776, longitude: 80.03897895396673 },
            { latitude: 6.820605366939263, longitude: 80.03924947842829 },
            { latitude: 6.82023846715535, longitude: 80.03921189932058 },
            { latitude: 6.819881038235556, longitude: 80.03879226898465 },
        ],
    },
    {
        id: 2,
        name: 'Faculty of Computing',
        coordinates: [
            { latitude: 6.819851829496487, longitude: 80.03885946059307 },
            { latitude: 6.820250378267711, longitude: 80.03917373089638 },
            { latitude: 6.820443072423562, longitude: 80.03937138530239 },
            { latitude: 6.820294873295268, longitude: 80.03976215878895 },
            { latitude: 6.8199502126045335, longitude: 80.03987175033784 },
            { latitude: 6.819583312820618, longitude: 80.03983417128154 },
            { latitude: 6.819550798381383, longitude: 80.03936626175665 },
        ],
    },
    // Add more small geofences here
];

export const checkLocationInGeofences = (coords, geofences, mainGeofence) => {
    const point = {
        latitude: coords.latitude,
        longitude: coords.longitude,
    };

    // Check if the user is inside the main geofence
    const insideMain = geolib.isPointInPolygon(point, mainGeofence.coordinates);

    for (let geofence of geofences) {
        const inside = geolib.isPointInPolygon(point, geofence.coordinates);
        if (inside) {
            return { insideMain, geofenceName: geofence.name };
        }
    }
    return { insideMain, geofenceName: null };
};

