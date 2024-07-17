import L from 'leaflet';
import iconurl from './bus-stop.png'
const iconPerson = new L.Icon({
  iconUrl: iconurl, // Path to your custom icon
    iconSize:     [38, 60], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 55], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

export { iconPerson };
