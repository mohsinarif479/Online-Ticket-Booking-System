const mongoose = require('mongoose');
const Flight = require('../models/Flight');

console.log('Connecting to MongoDB Atlas...');

mongoose.connect('mongodb+srv://l211763:mohsin123@cluster0.2wthpzf.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => console.error('MongoDB Atlas connection error:', err));

const checkFlights = async () => {
  try {
    const flights = await Flight.find({});
    console.log(`Found ${flights.length} flights:`);
    flights.forEach(flight => {
      console.log(`${flight.airline} ${flight.flightNumber}: ${flight.departureCity} -> ${flight.arrivalCity} (${flight.class} class) - $${flight.price}`);
    });
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error checking flights:', error);
    await mongoose.connection.close();
  }
};

// Wait for the connection before checking flights
mongoose.connection.once('open', () => {
  console.log('Starting flight check...');
  checkFlights();
}); 