import React from "react";

const FlightTitle = ({ totalFlight, from, to }: any) => {
  return (
    <h1 className="text-5xl lg:text-[32px] font-bold font-raleway">
      <span className="text-black">
        Showing {totalFlight}
        {totalFlight > 150 && "+"} Flights from{" "}
      </span>
      <span className="bg-gradient-to-b from-[#FF914D] to-[#F25C54] bg-clip-text text-transparent">
        {from}
      </span>
      <span className="text-black"> ({from}) to </span>
      <span className="bg-gradient-to-b from-[#FF914D] to-[#F25C54] bg-clip-text text-transparent">
        {to} ({to})
      </span>
    </h1>
  );
};

export default FlightTitle;
