"use client";

import Button from "@/components/ui/Button";
import http from "@/services/http";
import Head from "next/head";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Segment = {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
};

type SegmentWithLayover = Segment & {
  layover?: {
    airport: string;
    duration: string;
  };
};

type Journey = {
  type: "onward" | "return";
  segments: Segment[];
};

function splitJourneys(segments: Segment[], origin: string, destination: string): Journey[] {
  if (!segments || segments.length === 0) return [];

  const sorted = [...segments].sort(
    (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  );

  const returnStart = sorted.findIndex(seg => seg.origin === destination);

  if (returnStart > 0) {
    return [
      { type: "onward", segments: sorted.slice(0, returnStart) },
      { type: "return", segments: sorted.slice(returnStart) },
    ];
  } else {
    return [{ type: "onward", segments: sorted }];
  }
}

function formatCurrency(amount?: number, currency?: string) {
  if (typeof amount !== "number") return "-";
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 0,
  });
}

function getDuration(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m`;
}

function computeLayovers(segments: Segment[]): SegmentWithLayover[] {
  return segments.map((seg, idx) => {
    if (idx === 0) return seg; // first flight — no layover
    const prev = segments[idx - 1];
    const diff = new Date(seg.departureTime).getTime() - new Date(prev.arrivalTime).getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);

    return {
      ...seg,
      layover: {
        airport: prev.destination,
        duration: `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m`,
      },
    };
  });
}

const TicketDetailPage = () => {
  const { bookingid } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const [airportInfo, setAirportInfo] = useState<Record<string, { airport_name: string; city_name: string; airport_code: string }>>({});

  // Fetch airport info
  useEffect(() => {
    if (!ticket?.segments) return;
    const codesOrCities = Array.from(
      new Set(ticket.segments.flatMap((seg: any) => [seg.origin, seg.destination]).filter(Boolean))
    ) as string[];
    const missing = codesOrCities.filter(code => !airportInfo[code]);
    if (missing.length === 0) return;

    Promise.all(
      missing.map(async (val: string) => {
        try {
          if (val.length === 3) {
            const res = await http.get(`/airports/iatatoairportname?iata=${val}`);
            if (Array.isArray(res.data) && res.data[0]) return { code: val, info: res.data[0] };
          } else {
            const iataRes = await http.get(`/api/showIataCodes?query=${encodeURIComponent(val)}`);
            const iataCode = iataRes.data?.data?.[0]?.iata_code;
            if (iataCode) {
              const res = await http.get(`/airports/iatatoairportname?iata=${iataCode}`);
              if (Array.isArray(res.data) && res.data[0]) return { code: val, info: res.data[0] };
            }
          }
        } catch {}
        return null;
      })
    ).then(results => {
      const updates: Record<string, any> = {};
      results.forEach(r => {
        if (r && r.code && r.info) updates[r.code] = r.info;
      });
      if (Object.keys(updates).length > 0) setAirportInfo(prev => ({ ...prev, ...updates }));
    });
  }, [ticket]);

  // Fetch ticket data
  useEffect(() => {
    if (!bookingid) return;
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("access-token") : null;
    http
      .get(`/flight/history?bookingid=${bookingid}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then(res => {
        setTicket(res.data.data || res.data);
        setError("");
      })
      .catch(err => setError(err?.response?.data?.message || err.message || "Error fetching ticket details"))
      .finally(() => setLoading(false));
  }, [bookingid]);

  const formatAirport = (code: string) => {
    const info = airportInfo[code];
    return info ? `${info.city_name} (${info.airport_code})` : code || "-";
  };

  const journeys: Journey[] = ticket?.segments
    ? splitJourneys(ticket.segments, ticket.origin, ticket.destination)
    : [];

  const handleDownloadPDF = () => {
    if (!printRef.current) return alert("Content not ready for printing");
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    const printStyles = `
      <style>
        @media print {
          body { margin:0; padding:20px; font-family: 'Inter', Arial, sans-serif; background:#fff; }
          .ticket-container { max-width:none; margin:0; padding:0; box-shadow:none; border:none; }
          * { -webkit-print-color-adjust: exact; color-adjust: exact; }
        }
      </style>
    `;
    document.body.innerHTML = printStyles + `<div class="ticket-container">${printContent}</div>`;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading ticket...</div>;
  if (error) return <div className="text-red-600 text-center mt-20">{error}</div>;

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        body { font-family:'Inter',sans-serif; margin:0; padding:0; background:#E8F3FB; color:#1e293b; }
        .ticket-container { background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08); max-width:900px; margin:40px auto; padding:30px 40px; }
        header { text-align:center; border-bottom:2px solid #e2e8f0; padding-bottom:10px; margin-bottom:20px; position:relative; }
        .header-logo { position:absolute; left:0; top:10px; } .header-logo img{height:40px;}
        header h1 { color:#014569; font-weight:700; margin:0; }
        .booking-details { display:flex; justify-content:space-between; flex-wrap:wrap; font-size:14px; margin-bottom:20px; border-bottom:1px solid #e2e8f0; padding-bottom:10px; }
        .journey { margin-bottom:25px; background:#E8F3FB; border-radius:8px; padding:20px; }
        .journey-header { font-weight:600; font-size:16px; color:#014569; margin-bottom:15px; border-bottom:1px solid #cbd5e1; padding-bottom:5px; }
        .flight-block { background:#fff; border-radius:10px; margin-bottom:15px; padding:20px; border:1px solid #e2e8f0; box-shadow:0 2px 6px rgba(0,0,0,0.05); }
        .flight-header-row { display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #d1d5db; padding-bottom:8px; margin-bottom:10px; }
        .flight-route { font-weight:700; color:#014569; font-size:15px; }
        .airline { font-size:14px; color:#475569; font-style:italic; }
        .flight-info-grid {  display: flex;
          justify-content: space-between; 
          flex-wrap: nowrap;             
          font-size: 14px;
          gap: 10px;}
        .flight-info-grid div { background: #f9fafb;
          border-radius: 6px;
          padding: 6px 10px;
          flex: 1 1 0;                    
          text-align: center; }
        .flight-info-grid strong { color:#014569; }
        .layover { font-size:13px; color:#475569; font-style:italic; margin:8px 0 15px; text-align:center; background: rgba(1,69,105,0.05); width:fit-content; margin-left:auto; margin-right:auto; padding:5px 12px; border-radius:6px; }
        table { width:100%; border-collapse:collapse; margin-top:20px; font-size:14px; }
        th, td { border:1px solid #e2e8f0; padding:10px; text-align:left; }
        th { background-color:#E8F3FB; color:#014569; }
        .fare-section, .info-section { margin-top:20px; }
        .fare-details div, .info-section ul li { font-size:14px; line-height:1.5; }
        footer { border-top:1px solid #e2e8f0; padding-top:10px; text-align:center; font-size:13px; color:#64748b; margin-top:30px; }
        .cta-bar { background: linear-gradient(90deg,#F25C54 0%,#FF914D 100%); color:#fff; text-align:center; padding:8px; border-radius:8px; margin-top:20px; font-weight:600; letter-spacing:0.5px; }
      `}</style>

      <div ref={printRef} className="ticket-container">
        <header className="relative text-center mb-6">
          <div className="header-logo absolute left-0 top-0">
            <Image src="/Logo.svg" alt="Travulu Logo" width={120} height={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#014569]">E-TICKET</h1>
        </header>

        <div className="booking-details flex justify-between flex-wrap border-b border-gray-300 pb-4 mb-4 text-sm">
          <div>Booking ID: <strong>{ticket.bookingId}</strong></div>
          <div>Booked on: {ticket?.passengers?.[0]?.ticket?.IssueDate ? new Date(ticket.passengers[0].ticket.IssueDate).toLocaleString() : "-"}</div>
          <div>PNR: {ticket?.pnr}</div>
        </div>

        {/* Flights */}
        {journeys.map((journey, jdx) => {
          const segsWithLayover: SegmentWithLayover[] = computeLayovers(journey.segments);
          return (
            <div key={jdx} className="journey mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="journey-header font-semibold text-lg mb-2">
                {journey.type === "onward" ? "Onward Journey" : "Return Journey"}
              </div>
              
              {segsWithLayover.map((seg, idx) => (
                <div>{seg.layover && (
                    <div className="layover text-xs text-gray-500 mt-1 text-center">
                      Layover in {formatAirport(seg.layover.airport)}: {seg.layover.duration}
                    </div>
                  )}
                <div key={idx} className="flight-block border p-3 rounded-lg mb-3 bg-white">
                  <div className="flight-header-row flex justify-between">
                    <div className="flight-route font-medium">{formatAirport(seg.origin)} → {formatAirport(seg.destination)}</div>
                    <div className="airline text-sm text-gray-600">{ticket.airlineCode} {seg.flightNumber}</div>
                  </div>

                  <div className="flight-info-grid grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div><strong>Departure:</strong> {new Date(seg.departureTime).toLocaleString()}</div>
                    <div><strong>Arrival:</strong> {new Date(seg.arrivalTime).toLocaleString()}</div>
                    <div><strong>Duration:</strong> {getDuration(seg.departureTime, seg.arrivalTime)}</div>
                  </div>

                 
                </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Passengers */}
        <table className="w-full border-collapse mt-4 text-sm">
          <thead>
            <tr>
              <th>Passenger Name</th>
              <th>Seats</th>
              <th>Meal</th>
              <th>Priority Check-in</th>
              <th>Baggage</th>
            </tr>
          </thead>
          <tbody>
            {ticket.passengers?.map((p:any, idx:any) => (
              <tr key={idx}>
                <td>{`${p.title || ""} ${p.firstName} ${p.lastName} ${p.age ? `(Age: ${p.age})` : ""}`}</td>
                <td>{p.seatDynamic?.map((s:any) => s.Code).join(", ") || "-"}</td>
                <td>{p.meal?.map((m:any) => m.AirlineDescription || m.Code).join(", ") || "-"}</td>
                <td>{p.priorityCheckin ? "Yes" : "No"}</td>
                <td>{p.baggage?.map((b:any) => b.Text || b.Code).join(", ") || "15 kg + 7 kg"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Fare Details */}
        <section className="fare-section mt-4">
          <h3 className="font-semibold mb-2">Fare & Payment Details</h3>
          <div className="fare-details text-sm">
            {(() => {
              let totalBase=0, totalTax=0, totalOffered=0, currency="INR";
              ticket.passengers.forEach((p:any) => {
                totalBase += p.fare?.BaseFare || 0;
                totalTax += p.fare?.Tax || 0;
                totalOffered += p.fare?.OfferedFare || 0;
                if(p.fare?.Currency) currency=p.fare.Currency;
              });
              return <>
                <div>Base Fare: {formatCurrency(totalBase, currency)}</div>
                <div>Taxes & Fees: {formatCurrency(totalTax, currency)}</div>
                <div><strong>Total Fare: {formatCurrency(totalOffered, currency)}</strong></div>
                <div>Payment Mode: {ticket.paymentMode || "Online"}</div>
              </>;
            })()}
          </div>
        </section>

        {/* Travel Info */}
        <section className="info-section mt-4">
          <h3 className="font-semibold mb-2">Important Travel Information</h3>
          <ul className="text-sm list-disc ml-5">
            <li>Carry a valid Government-issued photo ID matching the name on the ticket.</li>
            <li>Arrive at least 3 hours before international flights and 2 hours before domestic flights.</li>
            <li>Check-in counters close 60 minutes before departure; gates close 25 minutes before departure.</li>
            <li>Cabin baggage limit: 7 kg; Check-in baggage limit: 25 kg per person.</li>
            <li>Ensure visas and travel documents are valid for all transit countries.</li>
          </ul>
        </section>

        <div className="cta-bar mt-6 p-3 text-center font-semibold text-white rounded bg-gradient-to-r from-[#F25C54] to-[#FF914D]">
          Thank you for flying with Travulu
        </div>

        <footer className="mt-4 text-xs text-center text-gray-500">
          For support, contact <strong>flightsupport@travulu.com</strong> | 24/7 helpline via Travulu website.
        </footer>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3 max-w-5xl mx-auto">
        <Button onClick={() => window.history.back()} className="!px-4 !py-2 bg-gray-100 text-[#001F50] border border-gray-300 hover:bg-gray-200">
          ← Back to Bookings
        </Button>
        <Button onClick={handleDownloadPDF} className="bg-[#0b66d3] text-white px-6 py-2 rounded" disabled={!ticket || loading}>
          Download PDF
        </Button>
      </div>
    </>
  );
};

export default TicketDetailPage;
