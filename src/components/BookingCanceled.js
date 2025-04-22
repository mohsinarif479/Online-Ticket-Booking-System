import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box, Alert } from '@mui/material';

const BookingCanceled = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const bookingId = params.get('id');

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your payment was canceled
        </Alert>
        
        <Typography variant="h5" gutterBottom>
          Payment Canceled
        </Typography>
        
        <Typography paragraph>
          Your booking (ID: {bookingId}) is still saved but remains in a pending state until payment is completed.
        </Typography>
        
        <Typography paragraph>
          You can try again or view your booking details in your account.
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate('/my-bookings')}
          >
            View My Bookings
          </Button>
          
          {bookingId && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate(`/book/${bookingId}/payment`)}
            >
              Try Payment Again
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingCanceled; 