const mongoose = require('mongoose');
const mongoUrl = 'mongodb://localhost:27017/';
const dbName = 'TravelTrack'; // Specify the database name

async function connectToMongo() {
    try {
        await mongoose.connect(mongoUrl + dbName, {
        });
        console.log('Connected to MongoDB successfully!');
        const db = mongoose.connection;
    
        // You can now use the 'db' object to interact with your database
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = connectToMongo;
