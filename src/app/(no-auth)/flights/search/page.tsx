import { metaObject } from "@/utils/functions/metadata";
import FlightSearch from "@/views/no-auth/flights/search";

export const metadata = {
  ...metaObject(
    "Search Flights",
    "Compare flights from top airlines. Book one-way or round-trip tickets with flexible dates"
  ),
};
const FlightSearchPage = () => {
  return <FlightSearch />;
};

export default FlightSearchPage;
