import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import locationPng from './location.png';

import OutlinedInput from '@mui/material/OutlinedInput';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";

const GetPassengerInput = () => {
  const currTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const navigate = useNavigate();
  const [listDestinationPlace, setListDestinationPlace] = useState([]);
  const [listSourcePlace, setlistSourcePlace] = useState([]);
  const [passengerInput, setPassengerInput] = useState({
    source: "",
    destination: "",
    time: currTime
  });
  
  const [error, setError] = useState(null);

  const fetchPlaces = (query,select) => {
    const params = {
      q: query,
      format: 'geojson'
    };
    const queryString = new URLSearchParams(params).toString();
    const requestOption = {
      method: "GET"
    };
    if(select=='source'){
    fetch(`${NOMINATIM_BASE_URL}${queryString}`, requestOption)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setlistSourcePlace(result.features)
      })
      .catch((error) => {
        console.log(error);
      });
    }else{
      fetch(`${NOMINATIM_BASE_URL}${queryString}`, requestOption)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setListDestinationPlace(result.features);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  };

  const onSourceChange = (e) => {
    const { name, value } = e.target;
    setPassengerInput({ ...passengerInput, [name]: value });
    fetchPlaces(value,'source');
  };
  const onDestinationChange = (e) => {
    const { name, value } = e.target;
    setPassengerInput({ ...passengerInput, [name]: value });
    fetchPlaces(value,'destination');
  };
  const onTimeChange = (e) => {
    const { name, value } = e.target;
    setPassengerInput({ ...passengerInput, [name]: value });
  };


  const handleSourceSelect = (place) => {
      setPassengerInput({ ...passengerInput, source: place.properties.name });
      setlistSourcePlace([]); // Clear the list after selection   
  };
  const handleDestinationSelect=(place)=>{
    setPassengerInput({ ...passengerInput, destination: place.properties.name });
    setListDestinationPlace([]); // Clear the list after selection
  }

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://192.168.0.105:5000/driver/availableDriver`, {
        params: {
          source: passengerInput.source,
          destination: passengerInput.destination,
          time: passengerInput.time
        }
      });
      console.log(res.data);
      navigate('/passenger/availableDrivers', { state: { driversData: res.data } });
    } catch (err) {
      console.error(err);
      console.log(passengerInput)
      setError("Failed to fetch available drivers. Please try again later.");
    }
  };

  return (
    <div className="max-w-xl  rounded shadow-lg pb-5 m-auto mt-10 bg-slate-100">
      <h1 className="mt-2 flex justify-center mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
        <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600 mr-3">Passenger</span> Inquiry
      </h1>
      <div className="flex justify-center mt-7 ml-5 mr-5">
        <form className="w-full max-w-lg" onSubmit={submit}>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-source-name">
                FROM
              </label>
              <OutlinedInput
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded  leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-source-name"
                name="source"
                type="text"
                value={passengerInput.source}
                onChange={onSourceChange}
                placeholder="Enter Source Name"
                autoComplete='off'
                required
              />
              
              <List component='nav' aria-label='main mailbox folders'>
              { listSourcePlace.map((item) => (
                <div key={item.id}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleSourceSelect(item)}>
                      <ListItemIcon>
                        <img src={locationPng} alt="O" className='h-8 w-8'/>
                      </ListItemIcon>
                      <ListItemText primary={item.properties.display_name} />
                    </ListItemButton>
                  </ListItem>
                </div>
              ))}
              </List>
            </div>
            <div className="w-full md:w-1/2 px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-destination-name">
                TO
              </label>
              <OutlinedInput
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded  leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-destination-name"
                name="destination"
                type="text"
                value={passengerInput.destination}
                onChange={onDestinationChange}
                placeholder="Enter Destination Name"
                autoComplete='off'
                required
              />
              <List component='nav' aria-label='main mailbox folders'>
              {listDestinationPlace.map((item) => (
                <div key={item.id}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleDestinationSelect(item)}>
                      <ListItemIcon>
                        <img src={locationPng} alt="O" className='h-8 w-8'/>
                      </ListItemIcon>
                      <ListItemText primary={item.properties.display_name} />
                    </ListItemButton>
                  </ListItem>
                </div>
              ))}
            </List>
            </div>
          </div>
          
          <div className="max-w-[15rem] mx-auto">
            <label htmlFor="time" className="block mb-2 text-sm font-medium text-gray-700">
              SET START TIME
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                <svg className="w-10 h-10 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd"/>
                </svg>
              </div>
              <input
                type="time"
                id="time"
                className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 px-5"
                name="time"
                value={passengerInput.time}
                onChange={onTimeChange}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs italic">{error}</p>
          )}
          <div className="mt-10 flex justify-center">
            <button className="min-w-60 w-1/5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500" type="submit">
              SEARCH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GetPassengerInput;
