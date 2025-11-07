import http from "@/services/http";

export const sendBookingRequest = (payload: any) => {
  return http.post("/hotels/book", payload);
};

export const sendConfirmationMail = (bookingId: string, token: any) => {
  return http.get(`/hotel/confirmation/mail?bookingid=${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const sendFailedMail = (token: any) => {
  return http.get("/hotel/booking-failed/mail", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const sendPendingMail = (token: any) => {
  return http.get("/hotel/booking-pending/mail", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchBookingDetails = (bookingId: string, userIp: string) => {
  return http.post("/hotels/booking-details", {
    BookingId: bookingId,
    EndUserIp: userIp,
  });
};

export const saveBookingDetails = (bookingId: string, userId?: string) => {
  return http.post("/hotel-bookings-details", {
    BookingId: bookingId,
    userId,
  });
};

export const createPaymentOrder = (paymentPayload: any) => {
  return http.post("/payments/create-order", paymentPayload);
};

// Create hotel booking record
export const createHotelBooking = (createPayload: any) => {
  return http.post("/hotel-booking/create", createPayload);
};

// Fetch user hotel booking history
export const fetchHotelBookingHistory = (userId: string | undefined) => {
  if (!userId) throw new Error("User ID is required to fetch booking history");
  return http.get(`/hotels/history?userId=${userId}`);
};

export const fetchUserIp = async (): Promise<any> => {
  const response = await fetch("https://ipapi.co/json/");
  if (!response.ok) {
    throw new Error("Failed to fetch IP info");
  }
  const data = await response.json();
  return data;
};
