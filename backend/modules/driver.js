const mongoose= require('mongoose')
const {Schema} =mongoose;

const driverSchema=new Schema({
     source:{
        type:String,
        required:true
    },
     destination:{
        type:String,
        required:true
     },
     source_lat:{
         type: Number,
         required:true
     },
    source_lng:{
      type: Number,
      required: true
     },
     destination_lat:{
         type: Number,
         required:true
     },
     destination_lng:{
      type: Number,
      required: true
     },
     vehicle:{
           type: String,
           required:true
     },
     roomId: {
      type: String,
      default:""
     },
     time:{
        type: String,
        require:true
     },
     date: {
      type: Date,
      expireAfterSeconds: 86400,
      default: () => {
          const now = new Date();
          // Calculate the offset for IST (UTC+5:30)
          const ISTOffset = 5.5 * 60 * 60 * 1000;
          const ISTDate = new Date(now.getTime() + ISTOffset);
          return ISTDate;
      },
  }
});   


module.exports=mongoose.model('driver',driverSchema);