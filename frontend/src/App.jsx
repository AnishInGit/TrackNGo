import React from 'react'
import{Routes,Route,Navigate} from 'react-router-dom'
import Home from './pages/Home'
import GetDriverInput from './pages/GetDriverInput'
import GetPassengerInput from './pages/GetPassengerInput'
import FetchAvailableDriver from './pages/FetchAvailableDriver'
import LocationSharing from './pages/LocationSharing'
const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/driver' element={<GetDriverInput/>}/>
      <Route path='/passenger' element={<GetPassengerInput/>}/>
      <Route path='/passenger/availableDrivers' element={<FetchAvailableDriver/>}/>
      <Route path='/locationSharing' element={<LocationSharing/>}/>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App