import { metaObject } from "@/utils/functions/metadata";
import FlightBooking from "@/views/no-auth/flights/booking";

export const metadata = {
  ...metaObject(
    "Booking Flight",
    "Compare flights from top airlines. Book one-way or round-trip tickets with flexible dates"
  ),
};
const FlightBookingPage = () => {
  return <FlightBooking />;
};

export default FlightBookingPage;
