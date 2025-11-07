// Centralized route for easy use and updates throughout the app
export const routes = {
  auth: { signIn: "/signin" },
  landing: "/",
  flights: {
    search: "/flights/search",
    booking: "/flights/booking",
  },
  hotels: {
    search: "/hotels/search",
  },
};
