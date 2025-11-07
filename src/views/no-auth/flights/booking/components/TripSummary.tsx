import http from "@/services/http";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import FareRuleModal from "../../search/components/FareRuleModal";

const getMainRoute = (segments: any) => {
  if (!segments || segments.length === 0) return null;

  const origin = segments[0]?.id.split("-")[0];
  const destination = segments[segments.length - 1]?.id.split("-")[1];

  return { origin, destination };
};

const TripSummary: any = ({
  flightSegmentOutBound,
  flightSegmentInBound,
}: any) => {
  const searchParams = useSearchParams();
  const outBound = getMainRoute(flightSegmentOutBound);
  const inBound = getMainRoute(flightSegmentInBound);
  const pnr =  searchParams.get("reissue_pnr");
  const bookingId = searchParams.get("reissue_bookingId");
  const ResultIndex = searchParams.get("flightId");
  const TraceId = searchParams.get("traceid");
  const [isOpen, setIsOpen] = useState(false);
  const [ruleDetail, setRuleDetail] = useState<string>("");

    const fetchFareRule = async () => {
    try {
      const { data } = await http.post("/fareRule", {
        ResultIndex: ResultIndex,
        TraceId: TraceId,
      });

      const detail =
        data?.Response?.FareRules?.[0]?.FareRuleDetail ||
        "No Fare Rule Details Available";
      setRuleDetail(detail);
      setIsOpen(true);
    } catch (err) {
      console.error("Failed to fetch fare rule:", err);
      setRuleDetail("Error fetching Fare Rule");
      setIsOpen(true);
    }
  };

  if (!outBound) return null;

  return (
    <>
    <div className="text-lg font-medium text-gray-800 mb-4">
      <h1 className="text-2xl font-nunito font-medium mt-5 mb-5 max-lg:text-4xl">
        {pnr && bookingId ? ("Review and confirm your New Flight From") : ("Your trip details from") } {" "}
        <span className="text-[#FF6F61]">{outBound.origin}</span> to{" "}
        <span className="text-[#FF6F61]">{outBound.destination}</span>
        {inBound && (
          <>
            {" "}
            and <span className="text-[#FF6F61]">{inBound.origin}</span> to{" "}
            <span className="text-[#FF6F61]">{inBound.destination}</span>
          </>
        )}
      </h1>
    </div>
    <div className="flex items-start gap-3 cursor-pointer">
      <p>
        This ticket is non-refundable and non-changeable. Please refer to the <span className="text-red font-nunito leading-relaxed underline" onClick={() => fetchFareRule()}>fare rules</span> for full details.
      </p>
    </div>

    <FareRuleModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            content={ruleDetail}
          />
    </>
  );
};

export default TripSummary;
