"use client";
import Button from "@/components/ui/NewButton";
import { CalendarDays, CircleCheckBig } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
// Resend Confirmation Email Button
import { LOCAL_KEY } from "@/common/enums";
import { routes } from "@/config/routes";
import http from "@/services/http";
import { getStorageItem } from "@/services/storage";
import { FlightBooking } from "@/types/flight-booking.types";
import { useRouter } from "next/navigation";
import ActivitySidebar from "./ActivitySidebar";
import ResendConfirmationButton from "./ResendConfirmationButton";

const FlightBookingContent = () => {
  const router = useRouter();
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(4);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | null>(null);

  // Refetch bookings logic extracted for reuse
  const fetchFlightHistory = async () => {
    const storedUser = getStorageItem(LOCAL_KEY.USER);
    if (!storedUser) {
      router.push("/");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);
      if (!token) {
        setFlightBookings([]);
        setLoading(false);
        setError("No access token found. Please log in again.");
        return;
      }
      let response;
      let bookings = [];
      // If no tab is selected (initial load), show all flights except cancelled
      if (!activeTab) {
        response = await http.get(`/flight/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
          bookings = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          bookings = response.data.data;
        } else if (response.data && typeof response.data === "object") {
          const possibleArrays = Object.values(response.data).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            bookings = possibleArrays[0];
          }
        }
        // Exclude cancelled
        bookings = bookings.filter((b: any) => b.status !== "cancelled");
        // Separate upcoming and past flights
        const now = new Date();
        const upcoming = bookings.filter((b: any) => {
          const dep = b.segments?.[0]?.departureTime;
          return dep && new Date(dep) >= now;
        });
        const past = bookings.filter((b: any) => {
          const dep = b.segments?.[0]?.departureTime;
          return dep && new Date(dep) < now;
        });
        // Sort both arrays ascending by departure time
        upcoming.sort(
          (a: any, b: any) =>
            new Date(a.segments?.[0]?.departureTime || 0).getTime() -
            new Date(b.segments?.[0]?.departureTime || 0).getTime()
        );
        past.sort(
          (a: any, b: any) =>
            new Date(a.segments?.[0]?.departureTime || 0).getTime() -
            new Date(b.segments?.[0]?.departureTime || 0).getTime()
        );
        bookings = [...upcoming, ...past];
      } else if (activeTab === "past") {
        // Fetch all, then filter to only past flights
        response = await http.get(`/flight/history?sort=desc`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
          bookings = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          bookings = response.data.data;
        } else if (response.data && typeof response.data === "object") {
          const possibleArrays = Object.values(response.data).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            bookings = possibleArrays[0];
          }
        }
        const now = new Date();
        bookings = bookings.filter((b: any) => {
          const dep = b.segments?.[0]?.departureTime;
          // Exclude cancelled
          return dep && new Date(dep) < now && b.status !== "cancelled";
        });
      } else {
        // Fetch only upcoming flights from /flight/upcoming
        response = await http.get(`/flight/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
          bookings = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          bookings = response.data.data;
        } else if (response.data && typeof response.data === "object") {
          const possibleArrays = Object.values(response.data).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            bookings = possibleArrays[0];
          }
        }
        // Exclude cancelled just in case
        bookings = bookings.filter((b: any) => b.status !== "cancelled");
        // Sort ascending by departure time
        bookings.sort(
          (a: any, b: any) =>
            new Date(a.segments?.[0]?.departureTime || 0).getTime() -
            new Date(b.segments?.[0]?.departureTime || 0).getTime()
        );
      }

      // Do not sort here; order is already upcoming first, then past, both ascending
      setFlightBookings(bookings);
    } catch (err) {
      console.error("❌ Error fetching flight history:", err);
      setError("Failed to fetch flight bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlightHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, activeTab]);

  // Pagination calculations
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = flightBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );
  const totalPages = Math.ceil(flightBookings.length / bookingsPerPage);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [flightBookings.length]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flight bookings...</p>
        </div>
      </div>
    );
  }

  if (error && flightBookings.length === 0) {
    // Show the attractive empty state if no bookings, even if error
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Image
          src="/assets/stories/transition_page_image.png"
          alt="No bookings illustration"
          width={220}
          height={180}
          className="mb-6"
        />
        <h2 className="text-xl font-bold text-gray-800 mb-2 font-raleway">
          No Bookings Yet
        </h2>
        <p className="text-gray-500 mb-4 font-nunito">
          You haven’t booked any flights yet. When you do, your bookings will
          appear here.
        </p>
        <Button onClick={() => router.push("/")} className="mt-2">
          Book a Flight
        </Button>
      </div>
    );
  } else if (error) {
    // Show error only if there are bookings but an error occurred
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

const handleSearch = (booking: any) => {
  const miniFareRules = booking?.miniFareRules?.filter(
    (rule: any) => rule.Type === "Reissue"
  );

  if (!miniFareRules?.length) {
    Swal.fire("No Reissue Fare Rules Found", "", "info");
    return;
  }

  // Build HTML table for SweetAlert
  const tableHtml = `
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr style="background:#f3f4f6; text-align:left;">
          <th style="padding:8px;">Journey</th>
          <th style="padding:8px;">From</th>
          <th style="padding:8px;">To</th>
          <th style="padding:8px;">Unit</th>
          <th style="padding:8px;">Details</th>
        </tr>
      </thead>
      <tbody>
        ${miniFareRules
          .map(
            (r: any) => `
          <tr>
            <td style="padding:6px;">${r.JourneyPoints || "-"}</td>
            <td style="padding:6px;">${r.From || "-"}</td>
            <td style="padding:6px;">${r.To || "-"}</td>
            <td style="padding:6px;">${r.Unit || "-"}</td>
            <td style="padding:6px;">${r.Details || "-"}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  const normalizeDate = (isoString: string) => {
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const passengerCounts = booking.passengers?.reduce(
    (acc: { adult: number; child: number; infant: number }, p: any) => {
      if (p.paxType === 1) acc.adult += 1;
      else if (p.paxType === 2) acc.child += 1;
      else if (p.paxType === 3) acc.infant += 1;
      return acc;
    },
    { adult: 0, child: 0, infant: 0 }
  );

  const segments = booking?.segments || [];
  let journeyType = "1"; // Default: one-way
  const segmentPayload: any[] = [];

  if (segments.length > 0) {
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    // Detect roundtrip
    if (lastSegment.destination === firstSegment.origin) {
      journeyType = "2";
    }

    if (journeyType === "1") {
      // One-way
      segmentPayload.push({
        Origin: firstSegment.origin,
        Destination: lastSegment.destination,
        FlightCabinClass: "1",
        PreferredDepartureTime: normalizeDate(firstSegment.departureTime),
        PreferredArrivalTime: normalizeDate(lastSegment.arrivalTime),
      });
    } else {
      // Roundtrip: split segments dynamically
      const half = Math.ceil(segments.length / 2);
      const onwardSegments = segments.slice(0, half);
      const returnSegments = segments.slice(half);

      const onwardFirst = onwardSegments[0];
      const onwardLast = onwardSegments[onwardSegments.length - 1];
      const returnFirst = returnSegments[0];
      const returnLast = returnSegments[returnSegments.length - 1];

      segmentPayload.push(
        {
          Origin: onwardFirst.origin,
          Destination: onwardLast.destination,
          FlightCabinClass: "1",
          PreferredDepartureTime: normalizeDate(onwardFirst.departureTime),
          PreferredArrivalTime: normalizeDate(onwardLast.arrivalTime),
        },
        {
          Origin: returnFirst.origin,
          Destination: returnLast.destination,
          FlightCabinClass: "1",
          PreferredDepartureTime: normalizeDate(returnFirst.departureTime),
          PreferredArrivalTime: normalizeDate(returnLast.arrivalTime),
        }
      );
    }
  }

  // Build query parameters
  const firstSeg = segmentPayload[0];
  const params: any = {
    origin: firstSeg.Origin,
    destination: firstSeg.Destination,
    date: firstSeg.PreferredDepartureTime,
    travellers: JSON.stringify({
      adults: passengerCounts.adult,
      children: passengerCounts.child,
      infants: passengerCounts.infant,
    }),
    travelClass: "economy",
    reissue_pnr : booking?.pnr,
    reissue_bookingId: booking?.bookingId,
  };

  // Add dateRange for roundtrip
  if (journeyType === "2" && segmentPayload[1]) {
    const onwardDate = segmentPayload[0].PreferredDepartureTime;
    const returnDate = segmentPayload[1].PreferredDepartureTime;
    params.dateRange = JSON.stringify([onwardDate, returnDate.replace(/T.*$/, "T23:59:59.999Z")]);
  }

  const queryParams = new URLSearchParams(params);
  // router.push(`${routes.flights.search}?${queryParams.toString()}`);

  const redirectUrl = `${routes.flights.search}?${queryParams.toString()}`;

  Swal.fire({
    title: "Mini Fare Rules (Reissue Only)",
    html: tableHtml,
    width: "60%",
    showCancelButton: true,
    confirmButtonText: "Proceed",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      // ✅ Redirect user
      router.push(redirectUrl);
    } else if (result.isDismissed) {
      // ✅ Close automatically — no action needed
      Swal.close();
    }
  });
};

const handleCancle = (booking: any) => {
  const miniFareRules = booking?.miniFareRules?.filter(
    (rule: any) => rule.Type === "Cancellation"
  );

  if (!miniFareRules?.length) {
    Swal.fire("No Cancellation Rules Found", "", "info");
    return;
  }

  // Build HTML table for SweetAlert
  const tableHtml = `
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr style="background:#f3f4f6; text-align:left;">
          <th style="padding:8px;">Journey</th>
          <th style="padding:8px;">From</th>
          <th style="padding:8px;">To</th>
          <th style="padding:8px;">Unit</th>
          <th style="padding:8px;">Details</th>
        </tr>
      </thead>
      <tbody>
        ${miniFareRules
          .map(
            (r: any) => `
          <tr>
            <td style="padding:6px;">${r.JourneyPoints || "-"}</td>
            <td style="padding:6px;">${r.From || "-"}</td>
            <td style="padding:6px;">${r.To || "-"}</td>
            <td style="padding:6px;">${r.Unit || "-"}</td>
            <td style="padding:6px;">${r.Details || "-"}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  Swal.fire({
    title: "Mini Fare Rules (Cancellation Only)",
    html: tableHtml,
    width: "60%",
    showCancelButton: true,
    confirmButtonText: "Proceed",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);
      if (!token) throw new Error("No access token");
      const body = {
        RequestType: 1,
        CancellationType: 3,
        BookingId: String(booking?.bookingId),
        Remarks: "Test remarks",
      };
      const res = http.post("/change-request", body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Flight cancellation request submitted successfully.");
    } else if (result.isDismissed) {
      Swal.close();
    }
  });
};

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-roboto">
            Booked Flight Details
          </h1>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-4 mb-6 font-nunito">
          <button
            type="button"
            className="bg-white text-[#001F50] border border-[#001F50] text-md py-2 px-3 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/icons/filter.svg"
                alt="Filter"
                width={20}
                height={20}
              />
              Filter
            </div>
          </button>

          <Button
            onClick={() => setActiveTab("past")}
            className={
              activeTab === "past"
                ? "min-w-2 bg-[#001F50] text-white border border-[#001F50] py-2 px-3"
                : "bg-white text-[#001F50] border border-[#001F50] py-2 px-3  min-w-2"
            }
          >
            Past
          </Button>
          <Button
            onClick={() => setActiveTab("upcoming")}
            className={
              activeTab === "upcoming"
                ? "min-w-[120px] bg-[#001F50] text-white border border-[#001F50] py-2 px-3"
                : "bg-white text-[#001F50] border border-[#001F50] py-2 px-3 min-w-[120px]"
            }
          >
            Upcoming
          </Button>
        </div>
      </div>

      {/* Flight Booking Cards */}
      {flightBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Image
            src="/assets/stories/transition_page_image.png"
            alt="No bookings illustration"
            width={220}
            height={180}
            className="mb-6"
          />
          <h2 className="text-xl font-bold text-gray-800 mb-2 font-raleway">
            No Bookings Yet
          </h2>
          <p className="text-gray-500 mb-4 font-nunito">
            You haven’t booked any flights yet. When you do, your bookings will
            appear here.
          </p>
          <Button onClick={() => router.push("/")} className="mt-2">
            Book a Flight
          </Button>
        </div>
      ) : (
        <>
          <section className="flex gap-3">
            <div className="flex-1 space-y-4">
              {currentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 font-nunito"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Section - Flight Details */}
                    <div className="flex-1 max-w-[60%]">
                      {/* Status and Type */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          <Image
                            src="/icons/flight_2.svg"
                            alt="Flight"
                            height={18}
                            width={18}
                          />
                          {booking.isDomestic ? "Domestic" : "International"}
                        </span>
                        <span className="flex items-center gap-2 text-green-600 text-xs">
                          <CircleCheckBig size={15} />
                          Confirmed
                        </span>
                      </div>

                      {/* Route */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-left">
                          <p className="text-lg font-bold text-gray-900">
                            {booking.origin}
                          </p>
                        </div>
                        <div className=" items-center justify-center">
                          <Image
                            src="/icons/flight3.svg"
                            alt="Airline"
                            height={18}
                            width={18}
                            className=" mx-auto"
                          />
                          <div className="w-16 border-t-2 border-dashed border-gray-300"></div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {booking.destination}
                          </p>
                        </div>
                      </div>

                      {/* Dates and Times */}
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <div className="text-xs">
                          <div className="flex items-center gap-2 mb-5">
                            <CalendarDays size={17} />
                            <span>
                              {formatDate(
                                booking.segments[0]?.departureTime ||
                                  new Date().toISOString()
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium">
                              {formatTime(
                                booking.segments[0]?.departureTime ||
                                  new Date().toISOString()
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs">
                          <div className="flex items-center gap-2 mb-3">
                            <Image
                              src="/icons/calendar.svg"
                              alt="Calendar"
                              height={24}
                              width={24}
                            />
                            <span>
                              {formatDate(
                                booking.segments[0]?.arrivalTime ||
                                  new Date().toISOString()
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium">
                              {formatTime(
                                booking.segments[0]?.arrivalTime ||
                                  new Date().toISOString()
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Flight Details */}
                      <div className="  mb-4 text-xs">
                        <div className="flex items-center gap-2 mb-3">
                          <Image
                            src="/icons/frame.svg"
                            alt="Passengers"
                            height={18}
                            width={18}
                          />
                          <span>
                            {booking.passengers.length} Person
                            {booking.passengers.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src="/icons/flight.svg"
                            alt="Airline"
                            height={18}
                            width={18}
                          />
                          <span className="font-medium">
                            {booking.airlineCode} Airline
                          </span>
                        </div>
                      </div>

                      {/* Flight Number and Fare */}
                    </div>

                    {/* Right Section - PNR and Actions */}
                    <div className="border-l-2 border-gray-200 pl-3">
                      {/* PNR Number */}
                      <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm text-gray-600 mb-2 font-bold">
                          PNR Number :-
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {booking.pnr}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-4">
                        {/* Show actions for upcoming flights, 'Flight completed' for past flights */}
                        {(() => {
                          const dep = booking.segments?.[0]?.departureTime;
                          const isPast = dep && new Date(dep) < new Date();
                          if (
                            activeTab === "upcoming" ||
                            (!activeTab && !isPast)
                          ) {
                            return (
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => handleSearch(booking)}
                                  type="button"
                                  className="bg-white text-[#001F50] border border-[#001F50] px-4 py-2 rounded-lg"
                                >
                                  Change Flight
                                </button>

                                {/* <CancelFlightButton
                                  bookingId={booking.bookingId}
                                  onSuccess={fetchFlightHistory}
                                /> */}
                                <button 
                                  onClick={() => handleCancle(booking)}
                                  type="button"
                                  className="bg-white text-[#001F50] border border-[#001F50] px-4 py-2 rounded-lg"
                                >
                                  Cancle Flight
                                </button>
                              </div>
                            );
                          } else if (
                            activeTab === "past" ||
                            (!activeTab && isPast)
                          ) {
                            return (
                              <h1 className="flex-none  gap-4 text-gray-400 italic text-center mx-auto text-lg font ">
                                Flight completed
                              </h1>
                            );
                          }
                          return null;
                        })()}

                        <ResendConfirmationButton bookingId={booking.bookingId} />
                        <Button
                          variant="solid"
                          color="danger"
                          size="md"
                          className="w-full text-white"
                          onClick={() =>
                            router.push(
                              `/dashboard/flight-booking/${booking.bookingId}`
                            )
                          }
                        >
                          View Trip Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <ActivitySidebar />
          </section>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center mt-8">
              {/* Page Info */}
              <div className="text-sm text-gray-600 mb-4">
                Showing{" "}
                <span className="font-semibold text-[#001F50]">
                  {indexOfFirstBooking + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-[#001F50]">
                  {Math.min(indexOfLastBooking, flightBookings.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#001F50]">
                  {flightBookings.length}
                </span>{" "}
                results
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;

                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 &&
                        pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors  cursor-pointer ${
                            currentPage === pageNumber
                              ? "bg-[#001F50] text-white shadow-md"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }

                    // Show ellipsis for gaps
                    if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="px-2 py-2 text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed   cursor-pointer transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M6 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Page Jump */}
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                <span>Go to page:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                />
                <span>of {totalPages}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlightBookingContent;
