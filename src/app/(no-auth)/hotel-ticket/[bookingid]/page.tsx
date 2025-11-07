"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import http from "@/services/http";

const HotelTicket = () => {
  const { bookingid } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingid) return;
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("access-token") : null;

    http
      .get(`/hotels/history-by-bookingid?bookingid=${bookingid}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then((res) => {
        setTicket(res.data.data || res.data);
        setError("");
      })
      .catch((err) =>
        setError(err?.response?.data?.message || err.message || "Error fetching ticket details")
      )
      .finally(() => setLoading(false));
  }, [bookingid]);

  // 🖨 Automatically print ONLY the ticket-container
  useEffect(() => {
    if (!ticket || !printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printStyles = `
      <style>
        @media print {
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Inter', Arial, sans-serif;
            background: white;
          }
          .ticket-container {
            max-width: none;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
          }
          * { -webkit-print-color-adjust: exact; color-adjust: exact; }
        }
      </style>
    `;

    // Replace body content with only ticket HTML before printing
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printStyles + `<div class="ticket-container">${printContent}</div>`;

    setTimeout(() => {
      window.print();
      document.body.innerHTML = originalContent;
      window.close();
    }, 800);
  }, [ticket]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading ticket...</div>;
  if (error) return <div className="text-red-600 text-center mt-20">{error}</div>;
  if (!ticket) return <div className="text-center mt-20">No ticket data found</div>;

  // Extract first guest as lead guest
  const leadGuest = ticket.passengers?.find((p: any) => p.LeadPassenger) || {};

  return (
    <div
      ref={printRef}
      className="ticket-container mx-auto max-w-4xl bg-white shadow-lg rounded-xl p-10 my-10 text-slate-800"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ===== HEADER ===== */}
      <header className="text-center border-b-2 border-gray-200 pb-3 mb-6 relative">
        <div className="absolute left-0 top-0">
          <img src="/Logo.svg" alt="Travulu Logo" className="h-10" />
        </div>
        <h1 className="text-2xl font-bold text-[#014569]">HOTEL E-TICKET</h1>
      </header>

      {/* ===== BOOKING DETAILS ===== */}
      <div className="flex justify-between flex-wrap border-b border-gray-200 pb-2 mb-5 text-sm">
        <div>Booking ID: <strong>{ticket.bookingId}</strong></div>
        <div>Booked on: {new Date(ticket.bookingDate).toLocaleString()}</div>
        <div>Confirmation No: {ticket.hotelConfirmationNo || ticket.confirmationNo}</div>
      </div>

      {/* ===== GUEST DETAILS ===== */}
      <section className="mb-6">
        <h2 className="text-[#014569] font-semibold text-base mb-2">Guest Details</h2>
        <div className="bg-[#E8F3FB] rounded-lg p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Lead Guest:</span><span>{leadGuest.firstName} {leadGuest.lastName}</span></div>
          <div className="flex justify-between"><span>Guests:</span><span>{ticket.passengers?.length} {ticket.passengers?.length > 1 ? "Guests" : "Guest"}</span></div>
          <div className="flex justify-between"><span>Number of Rooms:</span><span>{ticket.rooms?.length || 1}</span></div>
          <div className="flex justify-between"><span>Guest Names:</span><span>{ticket.passengers?.map((p: any) => `${p.firstName} ${p.lastName}`).join(', ')}</span></div>
          <div className="flex justify-between"><span>Contact Email:</span><span>{leadGuest.email}</span></div>
          <div className="flex justify-between"><span>Phone:</span><span>{leadGuest.phoneNo || "N/A"}</span></div>
        </div>
      </section>

      {/* ===== HOTEL DETAILS ===== */}
      <section className="mb-6">
        <h2 className="text-[#014569] font-semibold text-base mb-2">Hotel Details</h2>
        <div className="bg-[#E8F3FB] rounded-lg p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Hotel Name:</span><span>{ticket.hotelName}</span></div>
          <div className="flex justify-between"><span>Address:</span><span>{ticket.address}</span></div>
          <div className="flex justify-between"><span>City:</span><span>{ticket.city}</span></div>
          <div className="flex justify-between"><span>Check-in:</span><span>{new Date(ticket.checkInDate).toLocaleDateString()} | 14:00</span></div>
          <div className="flex justify-between"><span>Check-out:</span><span>{new Date(ticket.checkOutDate).toLocaleDateString()} | 12:00</span></div>
          <div className="flex justify-between"><span>Nights:</span><span>{ticket.rooms?.length || 1}</span></div>
        </div>
      </section>

      {/* ===== ROOM DETAILS ===== */}
      <section className="mb-6">
        <h2 className="text-[#014569] font-semibold text-base mb-2">Room Details</h2>
        {ticket.rooms?.map((room: any, idx: number) => (
          <div key={idx} className="bg-[#E8F3FB] rounded-lg p-4 space-y-1 text-sm mb-2">
            <div className="flex justify-between"><span>Room Type:</span><span>{room.roomTypeName}</span></div>
            <div className="flex justify-between"><span>Adults:</span><span>{room.adultCount}</span></div>
            <div className="flex justify-between"><span>Children:</span><span>{room.childCount}</span></div>
            <div className="flex justify-between"><span>Amenities:</span><span>{room.amenities?.join(", ") || "N/A"}</span></div>
          </div>
        ))}
      </section>

      {/* ===== PAYMENT DETAILS ===== */}
      <section className="mb-6">
        <h2 className="text-[#014569] font-semibold text-base mb-2">Payment Details</h2>
        <div className="space-y-1 text-sm">
          <div>Total Amount: {ticket.totalAmount}</div>
          <div>Status: {ticket.status}</div>
          <div>Invoice No: {ticket.invoiceNo}</div>
        </div>
      </section>

      {/* ===== INFO SECTION ===== */}
      <section className="mb-6">
        <h3 className="text-[#014569] font-semibold text-base mb-2">Important Information</h3>
        <ul className="list-disc pl-6 text-sm space-y-2">
          {JSON.parse(ticket.rateConditions || "[]").map((cond: string, idx: number) => (
            <li key={idx}>{cond}</li>
          ))}
        </ul>
      </section>

      {/* ===== THANK YOU BAR ===== */}
      <div className="bg-gradient-to-r from-[#F25C54] to-[#FF914D] text-white text-center py-2 rounded-lg font-semibold tracking-wide">
        Thank you for booking your stay with Travulu
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 mt-6 pt-3 text-center text-xs text-gray-600">
        For support, contact <strong>hotelsupport@travulu.com</strong> | 24/7 helpline via Travulu website.
      </footer>
    </div>
  );
};

export default HotelTicket;
