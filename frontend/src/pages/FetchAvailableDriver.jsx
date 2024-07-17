import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import busLogo from './1602.m10.i310.n020.F.c05.303028148 City bus at bus stop and urban skyline. Vector illustration in flat style.jpg';
import autoLogo from './7923562.jpg';
import eVehicle from './view-mini-three-wheeled-mobility-vehicle_23-2151016403.jpg';
import TrackingView from './TrackingView';
// import axios from 'axios';

const FetchAvailableDriver = () => {
  const location = useLocation();
  const driversData = location.state?.driversData || [];
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [source_lat,setSource_lat]=useState(null);
  const [source_lng,setSource_lng]=useState(null);
  const [destination_lat,setDestination_lat]=useState(null);
  const [destination_lng,setDestination_lng]=useState(null);

 
  // const checkUseravailable = async () => {
  //   try{
  //   const res= await axios.get(`http://192.168.0.105:5000/driver/availableDriver`,{
  //     params:{
  //       source: driversData.source,
  //           destination: driversData.destination,
  //           time: driversData.time
  //     }
  //   })
  //   if(res){
  //     return true;
  //   }else{
  //     return false
  //   }
  // }catch(error){
  //   console.log(error);
  // } 
  // };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const isMobileDevice = () => {
    return window.innerWidth <= 768;
  };

  const handleDriverSelection = (driver) => {
    console.log('Driver selected:', driver._id); 
    setSelectedDriverId(driver._id);

    setSource_lat(driver.source_lat);
    setSource_lng(driver.source_lng);
    setDestination_lat(driver.destination_lat);
    setDestination_lng(driver.destination_lng);

    if (isMobileDevice()) {
      scrollToBottom();
    } 
  };

  return (
    <div className='relative flex flex-col lg:flex-row'>
      <div className="w-full m-4 max-w-fit lg:w-1/3 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-center mb-4">
          <h1 className="ml-2 mt-2 flex items-center mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-3xl">
            <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600 mr-3 dark:text-white">Available Vehicles</span>
          </h1>
        </div>
        <div className="flow-root">
          
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {driversData.map((driver) => (
              <li 
                key={driver.id} 
                className="py-3 sm:py-4 group/item cursor-pointer" 
                onClick={() => handleDriverSelection(driver)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {driver.vehicle === "bus" && <img className="w-14 h-14 rounded-full scale-100 hover:scale-125" src={busLogo} alt="Bus" />}
                    {driver.vehicle === "auto rickshaw" && <img className="w-14 h-14 rounded-full scale-100 hover:scale-125" src={autoLogo} alt="Auto Rickshaw" />}
                    {driver.vehicle === "e-vehicle" && <img className="w-14 h-14 rounded-full scale-100 hover:scale-125" src={eVehicle} alt="E-Vehicle" />}
                  </div>
                  <div className="flex-1 min-w-0 ms-4">
                    <p className="text-lg text-wrap md:text-balance font-semibold text-gray-900 truncate dark:text-white">
                      {driver.source.toUpperCase()}&nbsp;&nbsp;To&nbsp;&nbsp;{driver.destination.toUpperCase()}
                    </p>
                    <p className="ml-0.5 text-sm text-gray-500 truncate dark:text-gray-500">
                      {driver.vehicle.toUpperCase()} &nbsp;&nbsp;&nbsp;&nbsp;{driver.roomId===''?<span className="p-1 bg-red-500 text-white dark:border-gray-800 rounded-full">INACTIVE</span>:<span className=" p-1 bg-green-400  text-white dark:border-gray-800 rounded-full">ACTIVE</span>}
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    &nbsp;&nbsp;Start <br />&nbsp;&nbsp;{driver.time}
                  </div>
                </div>
              </li>
            ))}
          </ul>

        </div>
      </div>
      <div className='lg:w-2/3 lg:m-10'>
        <TrackingView selectedDriverId={selectedDriverId} destination_lat={destination_lat} destination_lng={destination_lng} source_lat={source_lat} source_lng={source_lng} />
      </div>
    </div>
  );
};

export default FetchAvailableDriver;
