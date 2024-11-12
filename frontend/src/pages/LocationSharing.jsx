import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert } from "@material-tailwind/react";
import PropTypes from 'prop-types';
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import axios from 'axios';
import { iconPerson } from './Icon';

// Debounce function to limit frequency of calls
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const LocationSharing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const driversData = location.state?.driversData || [];
  const [currentPosition, setCurrentPosition] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [isTracking, setIsTracking] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const routingControlRef = useRef(null);
  const waypointsRef = useRef([]);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:5000');

    socket.current.on('connect', () => {
      console.log('Socket connected');
    });

    socket.current.on('storeRoomId', (data) => {
      console.log('Received storeRoomId event:', data);
      setRoomId(data.roomId);
      socket.current.emit('storeRoomId', { id: driversData._id, roomId: data.roomId });
    });

    socket.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    const successHandler = (position) => {
      const { latitude, longitude } = position.coords;
      const newPosition = { lat: latitude, lng: longitude };
      setCurrentPosition(newPosition);
      if (isTracking && roomId) {
        socket.current.emit('updateLocation', { roomId, location: newPosition });
      }
    };

    const errorHandler = (error) => {
      console.error('Error getting location', error);
      setPermissionStatus('denied');
    };

    const checkPermission = async () => {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        permission.onchange = () => setPermissionStatus(permission.state);
      }
    };

    checkPermission();

    if (permissionStatus === 'granted') {
      const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler);
      return () => navigator.geolocation.clearWatch(watchId);
    } else if (permissionStatus === 'prompt') {
      navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    }
  }, [permissionStatus, isTracking, roomId, driversData._id]);

  const handleButtonClick = async () => {
    const res = await axios.get(`http://localhost:5000/driver/?_id=${driversData._id}`);
    if (res.data && res.data.length > 0) {
      setIsTracking(true);
      socket.current.emit('createroom');
      setShowAlert(true);
    } else {
      navigate('/driver');
    }
  };

  const handleWaypointsChanged = (e) => {
    const newWaypoints = e.waypoints.map(wp => ({
      lat: wp.latLng.lat,
      lng: wp.latLng.lng,
    }));

    if (
      waypointsRef.current.length !== newWaypoints.length ||
      waypointsRef.current.some((wp, i) => wp.lat !== newWaypoints[i].lat || wp.lng !== newWaypoints[i].lng)
    ) {
      waypointsRef.current = newWaypoints;
      debounceEmitWaypoints();
    }
  };

  const debounceEmitWaypoints = debounce(() => {
    socket.current.emit('updateWaypoints', { roomId, waypoints: waypointsRef.current });
  }, 1000);

  const MapViewUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.flyTo(position, 13, {
          animate: true,
          duration: 1.5,
        });

        if (routingControlRef.current) {
          const currentWaypoints = routingControlRef.current.getWaypoints();
          const lastWaypoint = currentWaypoints[currentWaypoints.length - 1];

          if (lastWaypoint.latLng.lat === position.lat && lastWaypoint.latLng.lng === position.lng) {
            return; 
          }
          
          routingControlRef.current.on('waypointschanged', handleWaypointsChanged);

          routingControlRef.current.setWaypoints([
            ...currentWaypoints.slice(0, -1),
            L.latLng(driversData.destination_lat, driversData.destination_lng),
          ]);
        } else {
          routingControlRef.current = L.Routing.control({
            waypoints: [
              L.latLng(driversData.source_lat, driversData.source_lng),
              L.latLng(driversData.destination_lat, driversData.destination_lng)
            ],
            routeWhileDragging: true,
          }).addTo(map);

          routingControlRef.current.on('waypointschanged', handleWaypointsChanged);

          if (waypointsRef.current.length > 0) {
            routingControlRef.current.setWaypoints(waypointsRef.current);
          }
        }
      }

    }, [position, map]);
    return null;
  };

  MapViewUpdater.propTypes = {
    position: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }).isRequired,
  };

  return (
    <div>
      <div className="m-auto mt-8 w-96 lg:w-2/3 h-96 lg:h-[80vh] bg-white border border-gray-200 rounded-lg shadow dark:text-slate-200 dark:bg-gray-800 dark:border-gray-700">
        {showAlert && (
          <div className="absolute top-4 sm:w-1/3 left-1/2 transform -translate-x-1/2 z-10">
            <div className="text-nowrap sm:text-wrap bg-white border border-gray-300 max-w-fit rounded-lg lg:p-3 p-1.5 shadow-lg">
              <Alert className='pt-2 bg-green-600' onClose={() => setShowAlert(false)}>
                Your location is now live to others...!!!!
              </Alert>
            </div>
          </div>
        )}
        {currentPosition ? (
          <MapContainer center={[currentPosition.lat, currentPosition.lng]} zoom={13}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={currentPosition} icon={iconPerson} />
            <MapViewUpdater position={currentPosition} />
          </MapContainer>
        ) : (
          <p className='pt-14'>Getting location...</p>
        )}
        {permissionStatus === 'denied' && (
          <p>Location permission denied. Please enable it in your browser settings.</p>
        )}
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleButtonClick}
          className="mt-5 lg:mt-3 h-14 bg-gray-950 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
          disabled={showAlert || !currentPosition}
        >
          SHARE YOUR LIVE LOCATION TO OTHERS
        </button>
      </div>
    </div>
  );
};

export default LocationSharing;