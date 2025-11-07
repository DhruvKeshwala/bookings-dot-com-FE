export interface UpcomingNotification {
  type: string;
  id: number;
  bookingId: number;
  segments: Array<{
    id: number;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
  }>;
  upcomingDate: number;
}
