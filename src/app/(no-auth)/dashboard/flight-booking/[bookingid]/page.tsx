"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import http from "@/services/http";
import { CalendarDays } from "lucide-react";
import Image from "next/image";

function formatCurrency(amount?: number, currency?: string) {
  if (typeof amount !== "number") return "-";
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 0,
  });
}

const TicketDetailPage = () => {
  const { bookingid } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  // State to control which passenger is open; default to first
  const [openPassenger, setOpenPassenger] = useState<null | number>(0);
  const [airlineLogos, setAirlineLogos] = useState<Record<string, string>>({});
  // Airport info state
  const [airportInfo, setAirportInfo] = useState<
    Record<
      string,
      { airport_name: string; city_name: string; airport_code: string }
    >
  >({});

  // Fetch airport info for all segment IATA codes or city names
  useEffect(() => {
    if (!ticket?.segments) return;
    const codesOrCities = Array.from(
      new Set(
        ticket.segments
          .flatMap((seg: any) => [seg.origin, seg.destination])
          .filter(Boolean)
      )
    ) as string[];
    const missing = codesOrCities.filter((code: string) => !airportInfo[code]);
    if (missing.length === 0) return;
    Promise.all(
      missing.map(async (val: string) => {
        // If val is 3 letters, assume IATA code, else treat as city name
        if (val.length === 3) {
          try {
            const res = await http.get(
              `/airports/iatatoairportname?iata=${val}`
            );
            if (Array.isArray(res.data) && res.data[0]) {
              return { code: val, info: res.data[0] };
            }
          } catch {
            // ignore
          }
        } else {
          // Try to get IATA code from city name
          try {
            const iataRes = await http.get(
              `/api/showIataCodes?query=${encodeURIComponent(val)}`
            );

            const iataCode = iataRes.data?.data?.[0]?.iata_code;
            if (iataCode) {
              const res = await http.get(
                `/airports/iatatoairportname?iata=${iataCode}`
              );

              if (Array.isArray(res.data) && res.data[0]) {
                return { code: val, info: res.data[0] };
              }
            }
          } catch {
            // ignore
          }
        }
        return null;
      })
    ).then((results) => {
      const updates: Record<string, any> = {};
      results.forEach((r: any) => {
        if (r && r.code && r.info) updates[r.code as string] = r.info;
      });
      if (Object.keys(updates).length > 0)
        setAirportInfo((prev) => ({ ...prev, ...updates }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket]);
  const handleDownloadPDF = () => {
  const newWindow = window.open(`/flight-ticket/${bookingid}`);

  if (!newWindow) {
    alert("Popup blocked or failed to open new window.");
    return;
  }

  const checkContent = setInterval(() => {
    const printContainer = newWindow.document.querySelector(".ticket-container");
    if (printContainer) {
      clearInterval(checkContent);

      const printContent = printContainer.innerHTML;
      const printStyles = `
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: 'Inter', Arial, sans-serif; }
            .no-print { display: none !important; }
            .ticket-container { max-width: none; margin: 0; padding: 0; box-shadow: none; border: none; }
            * { -webkit-print-color-adjust: exact; color-adjust: exact; }
          }
        </style>
      `;
      newWindow.document.body.innerHTML = printStyles + '<div class="ticket-container">' + printContent + "</div>";

      setTimeout(() => {
        newWindow.print();
        newWindow.close();
      }, 500);
    }
  }, 300); // check every 300ms
};

  // const handleDownloadPDF = () => {
  //   if (!printRef.current) {
  //     alert("Content not ready for printing");
  //     return;
  //   }
  //   const printContent = printRef.current.innerHTML;
  //   const originalContent = document.body.innerHTML;
  //   const printStyles = `
  //     <style>
  //       @media print {
  //         body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
  //         .no-print { display: none !important; }
  //         .print-container { max-width: none; margin: 0; padding: 0; box-shadow: none; border: none; }
  //         * { -webkit-print-color-adjust: exact; color-adjust: exact; }
  //       }
  //     </style>
  //   `;
  //   document.body.innerHTML =
  //     printStyles + '<div class="print-container">' + printContent + "</div>";
  //   window.print();
  //   document.body.innerHTML = originalContent;
  //   window.location.reload();
  // };
  useEffect(() => {
    if (!ticket?.airlineCode) return;
    const code = ticket.airlineCode.toUpperCase();
    const fetchLogo = async () => {
      if (!code || airlineLogos[code]) return;
      try {
        const res = await http.get(`/logo/${code}`);
        console.log("Fetched logo for", code, res);
        if (res.data && (res.data.logoUrl || res.data.url)) {
          setAirlineLogos((prev) => ({
            ...prev,
            [code]: res.data.logoUrl || res.data.url,
          }));
        }
      } catch (err) {
        console.error("Error fetching logo for", code, err);
      }
    };
    fetchLogo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket]);
  useEffect(() => {
    if (!bookingid) return;
    setLoading(true);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access-token")
        : null;
    http
      .get(
        `/flight/history?bookingid=${bookingid}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
      .then((res) => {
        setTicket(res.data.data || res.data);
        setError("");
      })
      .catch((err) =>
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Error fetching ticket details"
        )
      )
      .finally(() => setLoading(false));
  }, [bookingid]);

  useEffect(() => {
    if (ticket) {
      console.log("Ticket data:", ticket);
    }
  }, [ticket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.history.back()}
            className="!px-4 !py-2 bg-gray-100 text-[#001F50] border border-gray-300 hover:bg-gray-200"
          >
            ← Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  // Log ticket data for debugging

  // --- UI Redesign ---
  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-container {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          * {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
      <div className="px-6 pt-6 pb-2 no-print">
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={() => window.history.back()}
            className="!px-4 !py-2 bg-gray-100 text-[#001F50] border border-gray-300 hover:bg-gray-200"
          >
            ← Back to Bookings
          </Button>
         
        </div>
      </div>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-0 shadow-lg border border-gray-100 font-nunito my-8 overflow-hidden">
        <div ref={printRef} className="print-container">
          <h1 className="text-3xl font-bold pl-6 pt-5">Flight Detail</h1>
          {ticket ? (
            <div className="flex flex-col md:flex-row mt-5">
              {/* Left: Timeline UI as per screenshot */}
              <div className="md:w-[70%] relative p-6 border-r-[2px] border-gray-200 h-1/2 ">
                {ticket.segments?.map((seg: any, idx: number) => {
                  const depTime = new Date(seg.departureTime);
                  const arrTime = new Date(seg.arrivalTime);
                  const depInfo = airportInfo[seg.origin];
                  const arrInfo = airportInfo[seg.destination];
                  const durationMs = arrTime.getTime() - depTime.getTime();
                  const hours = Math.floor(durationMs / (1000 * 60 * 60));
                  const mins = Math.floor((durationMs / (1000 * 60)) % 60);
                  const code = (ticket.airlineCode || "").toUpperCase();
                  const logoUrl =
                    code && airlineLogos[code] ? airlineLogos[code] : null;
                  return (
                    <div key={idx} className="flex flex-row gap-6 mb-10">
                      {/* Timeline column */}
                      <div className="flex flex-col items-center mr-4 min-w-[70px]  ">
                        {/* Departure time */}
                        <span className="text-2xl font-bold ">
                          {depTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                        <span className="text-xs text-gray-500 mb-4">
                          {depTime.toLocaleDateString([], {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                        {/* Duration */}
                        <span className="text-xs text-gray-500 my-4">
                          {hours > 0 ? `${hours}h ` : ""}
                          {mins}m
                        </span>
                        {/* Arrival time */}
                        <span className="text-2xl font-bold leading-none mt-10">
                          {arrTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {arrTime.toLocaleDateString([], {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                      {/* Vertical line */}
                      <div className="flex flex-col items-center">
                        <span
                          className="w-3 h-3 rounded-full border-2 bg-white block mb-1"
                          style={{ marginTop: "-10px" }}
                        ></span>
                        <span className="w-[1.3px] h-full bg-black"></span>
                        <span
                          className="w-3 h-3 rounded-full border-2 bg-white block mt-1"
                          style={{ marginBottom: "-10px" }}
                        ></span>
                      </div>
                      {/* Main info column */}
                      <div className="flex flex-col gap-2 flex-1">
                        {/* Departure block */}
                        <div>
                          <span className="text-base font-bold text-black">
                            {depInfo ? (
                              <>
                                {depInfo.city_name}({depInfo.airport_code})
                              </>
                            ) : (
                              <>{seg.origin}</>
                            )}
                          </span>
                          <div className="text-sm text-gray-700">
                            {depInfo
                              ? depInfo.airport_name
                              : seg.originAirportFullName || ""}
                          </div>
                        </div>
                        {/* Airline and flight info */}
                        <div className=" items-center gap-2 mt-2">
                          <div className="flex">
                            {logoUrl ? (
                              <Image
                                src={logoUrl}
                                alt={code}
                                height={18}
                                width={18}
                                style={{
                                  objectFit: "contain",
                                  border: "1px solid #eee",
                                  background: "#fff",
                                }}
                                unoptimized
                              />
                            ) : (
                              <Image
                                src="/icons/flight_2.svg"
                                alt="Flight"
                                height={18}
                                width={18}
                              />
                            )}
                            <span className="text-base font-semibold text-blue-700">
                              {code}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700 font-normal ml-2">
                              {seg.cabinClass || "Economy Class"} &bull;{" "}
                              {seg.flightNumber} &bull; {seg.aircraftType || ""}
                            </span>
                          </div>
                        </div>
                        {/* Destination block */}
                        <div className="mt-10 ">
                          <span className="text-base font-bold text-black">
                            {arrInfo ? (
                              <>
                                {arrInfo.city_name}({arrInfo.airport_code})
                              </>
                            ) : (
                              <>
                                {seg.destination}({seg.destinationAirportName})
                              </>
                            )}
                          </span>
                          <div className="text-sm text-gray-700">
                            {arrInfo
                              ? arrInfo.airport_name
                              : seg.destinationAirportFullName || ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Right: Details Card */}
              <div className="md:w-1/2 p-6">
                {/* For each direction/segment group, show a card */}
                {ticket.segments?.map((seg: any, idx: number) => (
                  <div key={idx} className="mb-6 pb-4">
                    <div className="font-bold text-lg mb-5">
                      {airportInfo[seg.origin]?.city_name || seg.origin} To{" "}
                      {airportInfo[seg.destination]?.city_name ||
                        seg.destination}
                    </div>
                    <div className=" items-center gap-2 text-xs text-gray-600 mb-1">
                      <span className="flex items-center gap-2 mb-3">
                        {" "}
                        <CalendarDays size={17} />{" "}
                        {new Date(seg.departureTime).toLocaleDateString([], {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 ">
                          {" "}
                          <Image
                            src="/icons/ticket.svg"
                            alt="Flight"
                            height={18}
                            width={18}
                          />{" "}
                          PNR No:-
                        </span>{" "}
                        <span className="font-bold text-base text-black">
                          {ticket.pnr}
                        </span>
                      </div>
                    </div>
                    {ticket.passengers?.map((p: any, pidx: number) => (
                      <div
                        key={pidx}
                        className="border-b-[2px] border-gray-200 py-2 space-y-2"
                      >
                        <div
                          className="font-bold text-sm my-3 flex items-center justify-between cursor-pointer select-none"
                          onClick={() =>
                            setOpenPassenger(
                              openPassenger === pidx ? null : pidx
                            )
                          }
                        >
                          Passenger {pidx + 1} Information
                          <Image
                            src="/icons/down_arrow.svg"
                            alt="Toggle Passenger Details"
                            height={18}
                            width={18}
                            style={{
                              transform:
                                openPassenger === pidx
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          />
                        </div>
                        {openPassenger === pidx && (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 font-medium">
                                <Image
                                  src="/icons/person.svg"
                                  alt="User"
                                  height={18}
                                  width={18}
                                />
                                {p.firstName} {p.lastName}
                              </div>
                              <span className="text-[#00B4D8] font-bold">
                                {p.gender || "Male"}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-medium">
                                  <Image
                                    src="/icons/seat.svg"
                                    alt="User"
                                    height={18}
                                    width={18}
                                  />
                                  Seat No:-
                                </div>
                                <span className="font-bold">
                                  {p.seatDynamic ? p.seatDynamic.map((s:any) => s.Code).join(", ") : "-"}
                                </span>
                              </div>
                            </div>
                            <p className="flex items-center gap-2 font-medium">
                              <Image
                                src="/icons/bag.svg"
                                alt="User"
                                height={18}
                                width={18}
                              />
                              {p.baggageInfo || "15 Kgs Checked, 7 Kgs Cabin"}
                            </p>
                            <div className="flex items-center gap-2 font-medium">
                              <Image
                                src="/icons/fbank.svg"
                                alt="User"
                                height={18}
                                width={18}
                              />
                              Standard
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                {/* Cancellation Policy */}
                {/* Fare & Policy Summary (Dynamic) */}
                <div className="mb-2">
                  <div className="font-bold text-sm mb-1">
                    Cancellation Policy
                  </div>
                  <div className="text-xs text-gray-500">
                    Please refer to your airline&apos;s cancellation policy for
                    details. Most international tickets are non-refundable or
                    have a fee for changes/cancellations.
                  </div>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-sm mb-1">
                    Check-In Information
                  </div>
                  <div className="text-xs text-gray-500">
                    Online check-in is available 24-48 hours before departure.
                    Please check your airline&apos;s website for details.
                  </div>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-sm mb-1">Fare Summary</div>
                  {(() => {
                    // Calculate total fare, taxes, discount from all passengers
                    let totalBase = 0,
                      totalTax = 0,
                      totalDiscount = 0,
                      totalOffered = 0,
                      currency = "INR";
                    if (ticket.passengers && ticket.passengers.length > 0) {
                      ticket.passengers.forEach((p: any) => {
                        totalBase += p.fare?.BaseFare || 0;
                        totalTax += p.fare?.Tax || 0;
                        totalDiscount += p.fare?.Discount || 0;
                        totalOffered += p.fare?.OfferedFare || 0;
                        if (p.fare?.Currency) currency = p.fare.Currency;
                      });
                    }
                    return (
                      <>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Base Fare</span>
                          <span>{formatCurrency(totalBase, currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Taxes</span>
                          <span>{formatCurrency(totalTax, currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Discount</span>
                          <span>
                            -{formatCurrency(totalDiscount, currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(totalOffered, currency)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                {/* Policy & Check-in info (optional, can be customized) */}

                <div className="flex justify-end mt-4">
                  {ticket && (
                    <Button
                      onClick={handleDownloadPDF}
                      className="bg-[#FF6B6B] text-white px-6 py-2 rounded"
                      disabled={!ticket || loading}
                    >
                      Download PDF
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              No ticket found.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TicketDetailPage;