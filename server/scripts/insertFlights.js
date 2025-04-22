const mongoose = require('mongoose');
const Flight = require('../models/Flight');

console.log('Connecting to MongoDB Atlas...');

mongoose.connect('mongodb+srv://l211763:mohsin123@cluster0.2wthpzf.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => console.error('MongoDB Atlas connection error:', err));

const sampleFlights = [
  {
    airline: 'Emirates',
    flightNumber: 'EK001',
    departureCity: 'New York',
    arrivalCity: 'Dubai',
    departureTime: '2024-03-15T10:00:00Z',
    arrivalTime: '2024-03-16T06:00:00Z',
    price: 850,
    availableSeats: 150,
    class: 'economy'
  },
  {
    airline: 'British Airways',
    flightNumber: 'BA154',
    departureCity: 'London',
    arrivalCity: 'Paris',
    departureTime: '2024-03-15T14:30:00Z',
    arrivalTime: '2024-03-15T16:45:00Z',
    price: 200,
    availableSeats: 100,
    class: 'economy'
  },
  {
    airline: 'Lufthansa',
    flightNumber: 'LH220',
    departureCity: 'Berlin',
    arrivalCity: 'Rome',
    departureTime: '2024-03-16T09:15:00Z',
    arrivalTime: '2024-03-16T11:30:00Z',
    price: 180,
    availableSeats: 120,
    class: 'economy'
  },
  {
    airline: 'Air France',
    flightNumber: 'AF380',
    departureCity: 'Paris',
    arrivalCity: 'Barcelona',
    departureTime: '2024-03-15T16:20:00Z',
    arrivalTime: '2024-03-15T18:10:00Z',
    price: 150,
    availableSeats: 90,
    class: 'economy'
  },
  {
    airline: 'Qatar Airways',
    flightNumber: 'QR707',
    departureCity: 'Dubai',
    arrivalCity: 'Singapore',
    departureTime: '2024-03-16T23:45:00Z',
    arrivalTime: '2024-03-17T12:30:00Z',
    price: 750,
    availableSeats: 200,
    class: 'economy'
  },
  {
    airline: 'Emirates',
    flightNumber: 'EK002',
    departureCity: 'Dubai',
    arrivalCity: 'New York',
    departureTime: '2024-03-17T08:30:00Z',
    arrivalTime: '2024-03-17T16:45:00Z',
    price: 890,
    availableSeats: 150,
    class: 'economy'
  },
  // Business Class Flights
  {
    airline: 'Emirates',
    flightNumber: 'EK001-B',
    departureCity: 'New York',
    arrivalCity: 'Dubai',
    departureTime: '2024-03-15T10:00:00Z',
    arrivalTime: '2024-03-16T06:00:00Z',
    price: 2500,
    availableSeats: 40,
    class: 'business'
  },
  {
    airline: 'British Airways',
    flightNumber: 'BA154-B',
    departureCity: 'London',
    arrivalCity: 'Paris',
    departureTime: '2024-03-15T14:30:00Z',
    arrivalTime: '2024-03-15T16:45:00Z',
    price: 600,
    availableSeats: 20,
    class: 'business'
  },
  // First Class Flights
  {
    airline: 'Emirates',
    flightNumber: 'EK001-F',
    departureCity: 'New York',
    arrivalCity: 'Dubai',
    departureTime: '2024-03-15T10:00:00Z',
    arrivalTime: '2024-03-16T06:00:00Z',
    price: 4500,
    availableSeats: 10,
    class: 'first'
  },
  {
    airline: 'British Airways',
    flightNumber: 'BA154-F',
    departureCity: 'London',
    arrivalCity: 'Paris',
    departureTime: '2024-03-15T14:30:00Z',
    arrivalTime: '2024-03-15T16:45:00Z',
    price: 1200,
    availableSeats: 8,
    class: 'first'
  }
];

const insertFlights = async () => {
  try {
    console.log('Clearing existing flights...');
    // Clear existing flights
    await Flight.deleteMany({});
    console.log('Cleared existing flights');

    console.log('Inserting new flights...');
    // Insert new flights
    const insertedFlights = await Flight.insertMany(sampleFlights);
    console.log(`Successfully inserted ${insertedFlights.length} flights`);
    
    // Log the inserted flights
    insertedFlights.forEach(flight => {
      console.log(`Added flight: ${flight.airline} ${flight.flightNumber} from ${flight.departureCity} to ${flight.arrivalCity}`);
    });

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error inserting flights:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Wait for the connection before inserting flights
mongoose.connection.once('open', () => {
  console.log('Starting flight insertion...');
  insertFlights();
}); 