# Flight Booking Page - API Integration

## Overview
This page displays a user's flight booking history by integrating with the flight booking API.

## API Integration

### Endpoint
- **GET** `/flight/history?userid=1`

### How It Works
1. **Component loads** - Automatically fetches flight data on mount
2. **API call** - Uses `http.get("/flight/history?userid=1")` 
3. **Data mapping** - Renders dynamic flight booking cards
4. **Error handling** - Shows loading, error, and empty states

### Features
- ✅ **Dynamic data loading** from API
- ✅ **Loading spinner** while fetching data
- ✅ **Error handling** with retry button
- ✅ **Empty state** when no bookings exist
- ✅ **Real-time data** - PNR, origin, destination, airline, dates

### Data Display
- **Flight Type**: Domestic/International based on `isDomestic` flag
- **Route**: Origin → Destination from API data
- **Dates**: Uses ticket issue date from passenger data
- **Passenger Count**: Dynamic count from API
- **Airline**: Airline code from API
- **PNR**: Actual PNR number from booking

## Usage

### 1. Set Environment Variable
```bash
NEXT_PUBLIC_BASE_URI=https://your-api-domain.com
```

### 2. API Response Structure
```typescript
{
  data: [
    {
      id: number;
      bookingId: number;
      pnr: string;
      isDomestic: boolean;
      origin: string;
      destination: string;
      airlineCode: string;
      segments: FlightSegment[]; // Flight departure/arrival times
      user: User;
      passengers: Passenger[];
    }
  ]
}

interface FlightSegment {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}

interface Passenger {
  id: number;
  paxId: number;
  firstName: string;
  lastName: string;
  paxType: number;
  dateOfBirth: string;
  contactNo: string;
  email: string;
  fare: Fare; // Complete fare breakdown
  ticket: Ticket; // Complete ticket details
}
```

### 3. Current Implementation
- Uses `userId = 1` (hardcoded for demo)
- Fetches data on component mount
- Maps through all bookings to display cards
- Maintains existing UI design

## Future Enhancements
- Add user authentication context
- Implement Past/Upcoming filters
- Add pagination for large lists
- Add refresh functionality
