const express=require('express');
const router= express.Router();
const driver=require('../modules/driver');

// Send driver details to database
router.post('/',async(req,res)=>{
    try{
        if(!req.body.source||!req.body.destination||!req.body.time ||!req.body.vehicle){
           return res.status(400).send({message: 'Fill all the required fields'});
        }
        const newDriver={
            source: req.body.source,
            destination: req.body.destination,
            source_lat:req.body.source_lat,
            source_lng:req.body.source_lng,
            destination_lat:req.body.destination_lat,
            destination_lng:req.body.destination_lng,
            time:req.body.time,
            vehicle:req.body.vehicle
        };
        const divr= await driver.create(newDriver);
        return res.status(202).send(divr);

    }catch(err){
         console.log(err.message);
         res.status(505).send({message:err.message});
    }
})
 
//Get all data of driver from database
router.get('/',async (req,res)=>{
    try{
      const drivers=await driver.find({});
      return res.status(200).json(drivers);

    }catch(error){
      console.log(error.message);
      res.status(506).send({message:error.message});

    }
});


//Get perfect matched drivers from database
router.get('/availableDriver',async (req,res)=>{
    try{
      const { source, destination ,time} = req.query;

      // Validate destination
      if (!source) {
        return res.status(400).json({ message: 'Source is required' });
    }
      if (!destination) {
        return res.status(400).json({ message: 'Destination is required' });
    }
    if(!time){
      return res.status(400).json({message: 'Time is required'})
    }
      // Query database for drivers matching the destination
      const drivers = await driver.find({
        source:source,
         destination: destination,
         time:{
          //greater than user give time
          $gte: time,

         }
      });
      
      // Check if drivers are found
        if (drivers.length === 0) {
         return res.status(404).json({ message: 'No drivers found for the destination' });
          }
     
      return res.status(200).json(drivers);

    }catch(error){
      console.log(error.message);
      res.status(506).send({message:error.message});

    }
});


//delete the driver from database
router.delete('/:id',async(req,res)=>{
try{
    const {id}= req.params;
    const result=await driver.findByIdAndDelete(id);
    if(!result){
        return res.status(400).json({message: "Driver not found"})
    }else{
        return res.status(203).json({message:'Deleted Successfully'});
    }
}catch(error){
  console.log(error.message);
  res.status(500).send({message:error.message})
}
})


module.exports=router;