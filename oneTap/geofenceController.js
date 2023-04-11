import * as turf from '@turf/turf';
export const geofences = [
  {
    id: 1,
    name: 'Faculty of Management',
    type: 'Polygon',
    coordinates: turf.polygon([
      [
        [80.0382640094262, 6.82082657142907],
        [80.03853536475592, 6.820932164888255],
        [80.03897895396673, 6.820971333456776],
        [80.03924947842829, 6.820605366939263],
        [80.03921189932058, 6.82023846715535],
        [80.0382640094262, 6.82082657142907],
      ],
    ]),
  },
  {
    id: 2,
    name: 'Faculty of Computing',
    type: 'Polygon',
    coordinates: turf.polygon([
      [
        [80.03885946059307, 6.819851829496487],
        [80.03917373089638, 6.820250378267711],
        [80.03937138530239, 6.820443072423562],
        [80.03976215878895, 6.820294873295268],
        [80.03987175033784, 6.8199502126045335],
        [80.03885946059307, 6.819851829496487],
      ],
    ]),
  },
];


export const isPointInGeofence = (point) => {

  for (let i = 1; i < geofences.length; i++) {
    console.log(geofences[i].coordinates);
    console.log(point);
    let status = turf.booleanPointInPolygon(point, geofences[i].coordinates);
console.log(`TEST13${status}`);
    if (status === true) {
      console.log(geofences[i]);
      return geofences[i];
    }
  }
};
