import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import axios from 'axios';

const FlightSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    departureCity: '',
    arrivalCity: '',
    departureDate: null,
    class: '',
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load all available flights when component mounts
  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async (params = {}) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:5000/api/flights/search/available', {
        params: {
          ...params,
          departureDate: params.departureDate ? dayjs(params.departureDate).format('YYYY-MM-DD') : '',
        },
      });

      setFlights(response.data.data.flights);
    } catch (error) {
      setError('Error fetching flights. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // Only include non-empty values in the search
    const searchQuery = Object.entries(searchParams).reduce((acc, [key, value]) => {
      if (value && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    await fetchFlights(searchQuery);
  };

  const handleInputChange = (field) => (event) => {
    setSearchParams({
      ...searchParams,
      [field]: event.target.value,
    });
  };

  const handleDateChange = (newValue) => {
    setSearchParams({
      ...searchParams,
      departureDate: newValue,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="From"
                value={searchParams.departureCity}
                onChange={handleInputChange('departureCity')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="To"
                value={searchParams.arrivalCity}
                onChange={handleInputChange('arrivalCity')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Departure Date"
                value={searchParams.departureDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={dayjs()}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={searchParams.class}
                  label="Class"
                  onChange={handleInputChange('class')}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  <MenuItem value="economy">Economy</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="first">First Class</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Flights'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Error Message */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Results */}
      <Grid container spacing={3}>
        {flights.map((flight) => (
          <Grid item xs={12} key={flight._id}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" gutterBottom>
                      {flight.airline}
                    </Typography>
                    <Typography color="textSecondary">
                      Flight {flight.flightNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6">{flight.departureCity}</Typography>
                        <Typography color="textSecondary">
                          {dayjs(flight.departureTime).format('HH:mm')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6">{flight.arrivalCity}</Typography>
                        <Typography color="textSecondary">
                          {dayjs(flight.arrivalTime).format('HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" gutterBottom>
                      {formatPrice(flight.price)}
                    </Typography>
                    <Typography color="textSecondary">
                      {flight.class.charAt(0).toUpperCase() + flight.class.slice(1)} Class • {flight.availableSeats} seats left
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/book/${flight._id}`)}
                  fullWidth
                >
                  Book Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Results Message */}
      {flights.length === 0 && !loading && (
        <Typography variant="body1" color="textSecondary" align="center">
          No flights found. Try different search criteria.
        </Typography>
      )}
    </Container>
  );
};

export default FlightSearch; 