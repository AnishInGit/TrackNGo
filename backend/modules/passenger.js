const mongoose= require('mongoose')

const {Schema} =mongoose;


const passengerSchema=new Schema({
    source:{
        type: String,
        required:true
    },
    destination:{
        type: String,
        required:true
    },
    date:{
        type:Date,
        default: () => new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      }
});


module.exports=mongoose.model('passenger',passengerSchema);