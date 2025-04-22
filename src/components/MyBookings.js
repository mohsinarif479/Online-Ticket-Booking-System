import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:5000/api/bookings/my-bookings',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings(response.data.data.bookings);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Error fetching bookings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Use the update-status endpoint instead of delete
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}/update-status`,
        { status: 'canceled' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh bookings list after successful cancellation
      await fetchBookings();
      setError('');
    } catch (error) {
      console.error('Cancel booking error:', error);
      setError(
        error.response?.data?.message ||
          'Error canceling booking. Please try again.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      setActionLoading(bookingId);
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
      console.error('Payment initiation error:', error);
      setError(
        error.response?.data?.message ||
          'Error processing payment. Please try again.'
      );
      setActionLoading(null);
    }
  };

  const getStatusChip = (status) => {
    let color = 'default';
    let icon = null;

    switch (status) {
      case 'confirmed':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'canceled':
        color = 'error';
        break;
      default:
        break;
    }

    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={color}
        size="small"
        icon={icon}
        sx={{ ml: 1 }}
      />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No bookings found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/search')}
            sx={{ mt: 2 }}
          >
            Search Flights
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking._id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Typography variant="h6">
                        {booking.flight.departureCity} → {booking.flight.arrivalCity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(booking.flight.departureTime).format(
                          'MMM D, YYYY HH:mm'
                        )}
                      </Typography>
                    </div>
                    <div>
                      {getStatusChip(booking.status)}
                    </div>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Flight Details</strong>
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography>
                          <strong>Flight Number:</strong>{' '}
                          {booking.flight.flightNumber}
                        </Typography>
                        <Typography>
                          <strong>Airline:</strong> {booking.flight.airline}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography>
                          <strong>Class:</strong>{' '}
                          {booking.flight.class.charAt(0).toUpperCase() + 
                            booking.flight.class.slice(1)}
                        </Typography>
                        <Typography>
                          <strong>Total Price:</strong> $
                          {booking.totalPrice.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Passengers</strong>
                    </Typography>
                    <Grid container spacing={2}>
                      {booking.passengers.map((passenger, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Paper
                            variant="outlined"
                            sx={{ p: 2, backgroundColor: 'background.default' }}
                          >
                            <Typography>
                              {passenger.firstName} {passenger.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Passport: {passenger.passportNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Seat: {passenger.seatNumber}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      {booking.status === 'pending' && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<PaymentIcon />}
                          onClick={() => handlePayment(booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          {actionLoading === booking._id ? 'Processing...' : 'Complete Payment'}
                        </Button>
                      )}
                      
                      {booking.status !== 'canceled' && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          {actionLoading === booking._id ? 'Processing...' : 'Cancel Booking'}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyBookings; 