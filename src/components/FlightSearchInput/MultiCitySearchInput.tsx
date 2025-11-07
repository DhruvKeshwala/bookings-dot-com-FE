import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import SearchInput from "./SearchInput";

export default function MultiCitySearchInput() {
  const [flights, setFlights] = useState([1, 2]);
  return (
    <>
      {flights.map((_, index) => (
        <Fragment key={index}>
          <h2 className="font-nunito font-bold text-3xl text-primary mt-6">
            Flight {index + 1}
          </h2>
          <SearchInput
            showSearchButton={false}
            showRemoveButton={flights.length > 2}
            onRemove={() => setFlights((prev) => prev.toSpliced(index, 1))}
          />
        </Fragment>
      ))}
      <button
        onClick={() => {
          setFlights((prev) => [...prev, 1]);
        }}
        className="flex mt-6 text-xl font-nunito font-bold gap-2"
      >
        <Image src="/icons/plus.svg" width={24} height={24} alt="Add flight" />
        Add Flight
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-between w-full mt-6">
        <div className="flex items-start gap-2 max-w-2xl">
          <input type="checkbox" id="subscribe" className="mt-1.5" />
          <label htmlFor="subscribe">
            I would like to receive exclusive offers and news from Launcherr. I
            am aware that I can unsubscribe at any time.
          </label>
        </div>

        <div className="lg:flex justify-end">
          <Link
            href="/flights/search"
            className="justify-center items-center rounded-lg flex min-h-[83px] gap-2.5 text-foreground whitespace-nowrap min-w-[227px] bg-gradient px-6 py-7 font-semibold text-xl font-[Nunito] max-lg:whitespace-normal max-lg:px-5 flex-shrink-0 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/icons/search.svg"
              alt="Search icon"
              width={24}
              height={24}
              className="aspect-square object-contain"
            />
            <span>Search</span>
          </Link>
        </div>
      </div>
    </>
  );
}
