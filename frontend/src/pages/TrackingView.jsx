import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import io from 'socket.io-client';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import 'leaflet-routing-machine';
import { iconPerson } from './Icon';

const initialCenter = {
  lat: 22.3973,
  lng: 87.7386
};

const socket = io('http://localhost:5000');

const TrackingView = ({ selectedDriverId, destination_lat, destination_lng, source_lat, source_lng }) => {
  const [trackingPosition, setTrackingPosition] = useState(initialCenter);
  const [isTracking, setIsTracking] = useState(false);
  const [waypoints, setWaypoints] = useState([]);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (selectedDriverId) {
      setIsTracking(true);
      socket.emit('trackLocation', { driverId: selectedDriverId });
    } else {
      setIsTracking(false);
    }
  }, [selectedDriverId]);

  useEffect(() => {
    if (isTracking) {
      const handleLocationUpdate = (data) => {
        setTrackingPosition(data.location);
      };

      const handleWaypointsUpdate = (data) => {
        if (JSON.stringify(waypoints) !== JSON.stringify(data.waypoints)) {
          setWaypoints(data.waypoints);
        }
      };

      socket.on('locationUpdate', handleLocationUpdate);
      socket.on('waypointsUpdate', handleWaypointsUpdate);

      return () => {
        socket.off('locationUpdate', handleLocationUpdate);
        socket.off('waypointsUpdate', handleWaypointsUpdate);
      };
    }
  }, [isTracking, waypoints]);

  useEffect(() => {
    if (mapRef.current) {
      if (routingControlRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
      }
      if (waypoints.length > 0) {
        routingControlRef.current = L.Routing.control({
          waypoints: [
            L.latLng(source_lat, source_lng),
            ...waypoints.map(point => L.latLng(point.lat, point.lng)),
            L.latLng(destination_lat, destination_lng)
          ],
          routeWhileDragging: true,
        }).addTo(mapRef.current);
      }
    }
  }, [waypoints, source_lat, source_lng, destination_lat, destination_lng]);

  const SmoothMarker = ({ position }) => {
    const markerRef = useRef(null);

    useEffect(() => {
      if (markerRef.current) {
        markerRef.current.setLatLng(position).update();
        L.DomUtil.setOpacity(markerRef.current._icon, 0.8); // Set initial opacity for smooth transition
        setTimeout(() => {
          L.DomUtil.setOpacity(markerRef.current._icon, 1); // Restore opacity for smooth transition
        }, 1000); // Adjust the timeout for smoother transition
      }
    }, [position]);

    return <Marker position={position} ref={markerRef} icon={iconPerson} />;
  };

  SmoothMarker.propTypes = {
    position: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired
    }).isRequired
  };

  const MapViewUpdater = ({ position }) => {
    const map = useMap();
    mapRef.current = map;

    useEffect(() => {
      if (position) {
        map.flyTo(position, 13, {
          animate: true,
          duration: 1.5, // Adjust the duration for smooth animation
        });
      }
    }, [position, map]);

    return null;
  };

  MapViewUpdater.propTypes = {
    position: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired
    }).isRequired
  };

  return (
    <div className="flex lg:fixed lg:w-[60vW] h-96 lg:h-[85vh] bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <MapContainer center={[trackingPosition.lat, trackingPosition.lng]} zoom={5} whenCreated={mapInstance => { mapRef.current = mapInstance; }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SmoothMarker position={trackingPosition} />
        <MapViewUpdater position={trackingPosition} />
      </MapContainer>
    </div>
  );
};

TrackingView.propTypes = {
  selectedDriverId: PropTypes.string,
  destination_lat: PropTypes.number,
  destination_lng: PropTypes.number,
  source_lat: PropTypes.number,
  source_lng: PropTypes.number
};

export default TrackingView;
