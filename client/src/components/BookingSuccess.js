import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const updateBookingStatus = async () => {
      try {
        // Get booking ID from URL params
        const params = new URLSearchParams(location.search);
        const bookingId = params.get('id');

        if (!bookingId) {
          setError('Booking ID not found');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Update booking status to confirmed
        await axios.patch(
          `http://localhost:5000/api/bookings/${bookingId}/update-status`,
          { status: 'confirmed' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch updated booking
        const response = await axios.get(
          `http://localhost:5000/api/bookings/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBooking(response.data.data.booking);
      } catch (error) {
        setError('Error updating booking status');
        console.error('Booking update error:', error);
      } finally {
        setLoading(false);
      }
    };

    updateBookingStatus();
  }, [location.search, navigate]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Processing your payment...
        </Typography>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">{error || 'Unable to process booking'}</Alert>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/my-bookings')}
          >
            Go to My Bookings
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Payment Successful!
          </Typography>
          <Typography variant="subtitle1">
            Your booking has been confirmed.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Booking Details
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography>
            <strong>Booking ID:</strong> {booking._id}
          </Typography>
          <Typography>
            <strong>Flight:</strong> {booking.flight.flightNumber} - {booking.flight.airline}
          </Typography>
          <Typography>
            <strong>From:</strong> {booking.flight.departureCity}
          </Typography>
          <Typography>
            <strong>To:</strong> {booking.flight.arrivalCity}
          </Typography>
          <Typography>
            <strong>Date:</strong> {new Date(booking.flight.departureTime).toLocaleString()}
          </Typography>
          <Typography>
            <strong>Passengers:</strong> {booking.passengers.length}
          </Typography>
          <Typography>
            <strong>Total Amount:</strong> ${booking.totalPrice.toFixed(2)}
          </Typography>
          <Typography>
            <strong>Status:</strong>{' '}
            <span style={{ color: 'green', fontWeight: 'bold' }}>
              {booking.status.toUpperCase()}
            </span>
          </Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/my-bookings')}
            sx={{ minWidth: 200 }}
          >
            View All Bookings
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingSuccess; 