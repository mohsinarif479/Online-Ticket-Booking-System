import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import dayjs from 'dayjs';

const BookingForm = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [passengers, setPassengers] = useState([
    { firstName: '', lastName: '', passportNumber: '', seatNumber: '' },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);

  const steps = ['Enter passenger details', 'Confirm booking', 'Payment'];

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/flights/${flightId}`
        );
        setFlight(response.data.data.flight);
        
        // Fetch booked seats for this flight
        await fetchBookedSeats(response.data.data.flight._id);
      } catch (error) {
        setError('Error loading flight details');
        console.error('Flight fetch error:', error);
      }
    };

    fetchFlight();
  }, [flightId]);

  const fetchBookedSeats = async (flightId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/booked-seats/${flightId}`);
      setBookedSeats(response.data.data.bookedSeats || []);
      
      // Generate available seats based on class and booked seats
      if (flight) {
        generateAvailableSeats(flight.class, response.data.data.bookedSeats || []);
      }
    } catch (error) {
      console.error('Error fetching booked seats:', error);
    }
  };

  useEffect(() => {
    if (flight) {
      generateAvailableSeats(flight.class, bookedSeats);
    }
  }, [flight, bookedSeats]);

  const generateAvailableSeats = (flightClass, booked) => {
    let seats = [];
    let prefix = '';
    let count = 0;
    
    switch (flightClass.toLowerCase()) {
      case 'first':
        prefix = 'F-';
        count = 10;
        break;
      case 'business':
        prefix = 'B-';
        count = 20;
        break;
      case 'economy':
      default:
        prefix = 'E-';
        count = 50;
        break;
    }
    
    for (let i = 1; i <= count; i++) {
      const seatNumber = `${prefix}${i}`;
      if (!booked.includes(seatNumber)) {
        seats.push(seatNumber);
      }
    }
    
    setAvailableSeats(seats);
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value,
    };
    setPassengers(updatedPassengers);
  };

  const addPassenger = () => {
    if (passengers.length < flight.availableSeats) {
      setPassengers([
        ...passengers,
        { firstName: '', lastName: '', passportNumber: '', seatNumber: '' },
      ]);
    }
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(updatedPassengers);
    }
  };

  const isSeatAlreadySelected = (seatNumber) => {
    return passengers.some((p, currentIndex) => 
      p.seatNumber === seatNumber
    );
  };

  const getAvailableSeatsForPassenger = (currentPassengerIndex) => {
    return availableSeats.filter(seat => 
      !passengers.some((p, idx) => p.seatNumber === seat && idx !== currentPassengerIndex)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that all passengers have selected seats
    const missingSeats = passengers.some(p => !p.seatNumber);
    if (missingSeats) {
      setError('All passengers must select a seat');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        {
          flight: flightId,
          passengers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookingId(response.data.data.booking._id);
      setActiveStep(1); // Move to confirmation step
    } catch (error) {
      setError(
        error.response?.data?.message || 'Error creating booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.post(
        `http://localhost:5000/api/bookings/create-checkout-session/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Redirect to Stripe checkout
      window.location.href = response.data.data.url;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Error creating payment session. Please try again.'
      );
      setPaymentLoading(false);
    }
  };

  if (!flight) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading flight details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Book Flight
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Flight Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Flight Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Flight Number:</strong> {flight.flightNumber}
              </Typography>
              <Typography>
                <strong>Airline:</strong> {flight.airline}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>From:</strong> {flight.departureCity}
              </Typography>
              <Typography>
                <strong>To:</strong> {flight.arrivalCity}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Departure:</strong>{' '}
                {dayjs(flight.departureTime).format('MMM D, YYYY HH:mm')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Class:</strong>{' '}
                {flight.class.charAt(0).toUpperCase() + flight.class.slice(1)}
              </Typography>
              <Typography>
                <strong>Price per person:</strong> $
                {flight.price.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <form onSubmit={handleSubmit}>
            {/* Passenger Forms */}
            {passengers.map((passenger, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">
                    Passenger {index + 1}
                  </Typography>
                  {passengers.length > 1 && (
                    <IconButton
                      onClick={() => removePassenger(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={passenger.firstName}
                      onChange={(e) =>
                        handlePassengerChange(index, 'firstName', e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={passenger.lastName}
                      onChange={(e) =>
                        handlePassengerChange(index, 'lastName', e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Passport Number"
                      value={passenger.passportNumber}
                      onChange={(e) =>
                        handlePassengerChange(
                          index,
                          'passportNumber',
                          e.target.value
                        )
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!passenger.seatNumber}>
                      <InputLabel>Seat Number</InputLabel>
                      <Select
                        value={passenger.seatNumber}
                        label="Seat Number"
                        onChange={(e) =>
                          handlePassengerChange(index, 'seatNumber', e.target.value)
                        }
                      >
                        {getAvailableSeatsForPassenger(index).map((seat) => (
                          <MenuItem key={seat} value={seat}>
                            {seat}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {!passenger.seatNumber 
                          ? 'Please select a seat' 
                          : `${flight.class.charAt(0).toUpperCase() + flight.class.slice(1)} Class Seat`}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Box sx={{ mb: 3 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={addPassenger}
                disabled={passengers.length >= Math.min(flight.availableSeats, availableSeats.length)}
              >
                Add Passenger
              </Button>
              {passengers.length >= availableSeats.length && (
                <FormHelperText error sx={{ ml: 1 }}>
                  No more seats available
                </FormHelperText>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Total: ${(flight.price * passengers.length).toFixed(2)}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </Box>
          </form>
        )}

        {activeStep === 1 && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your booking has been confirmed! Booking ID: {bookingId}
            </Alert>
            
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            <Typography paragraph>
              Total Amount: ${(flight.price * passengers.length).toFixed(2)}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handlePayment}
                disabled={paymentLoading}
                startIcon={paymentLoading && <CircularProgress size={20} color="inherit" />}
              >
                {paymentLoading ? 'Preparing Checkout...' : 'Proceed to Payment'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default BookingForm; 