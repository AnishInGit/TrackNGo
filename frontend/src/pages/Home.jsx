import React from 'react';
import { useNavigate } from 'react-router-dom';
import driverPhoto from './vecteezy_cheerful-3d-driver-wearning-suits-for-airport-or-travel_22483648.png';
import passengerPhoto from './vecteezy_3d-traveller-character-sitting-on-a-suitcase-and-checking_36309413.png';

const Home = () => {
  const navigate = useNavigate();

  const handleOnclickDriver = () => {
    console.log("Driver Button Clicked!");
    navigate('/driver');
  };

  const handleOnclickPassenger = () => {
    console.log("Passenger Button Clicked!");
    navigate('/passenger');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr p-10">
      <div className="w-max mb-8">
        <h1 className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 text-2xl text-fit  lg:text-5xl text-white font-bold">
          Welcome To TrackNGo.....
        </h1>
      </div>
      <div className="flex flex-col items-center space-y-10 lg:flex-row lg:space-y-0 lg:space-x-14">
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:space-x-4">
          <img
            className="h-48 w-48 lg:h-96 lg:w-96 object-cover object-center mb-4 lg:mb-0"
            src={passengerPhoto}
            alt="passenger"
          />
          <button
            className="min-w-fit min-h-14 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
            type="button"
            onClick={handleOnclickPassenger}
          >
            Enter as Passenger
          </button>
        </div>
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:space-x-4">
          <img
            className="h-48 w-48 lg:h-96 lg:w-96 rounded-full object-cover object-center mb-4 lg:mb-0"
            src={driverPhoto}
            alt="driver"
          />
          <button
            className="min-w-fit min-h-14  bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
            type="button"
            onClick={handleOnclickDriver}
          >
            Enter as Driver
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
