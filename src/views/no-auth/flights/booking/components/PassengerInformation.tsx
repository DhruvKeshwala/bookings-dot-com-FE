import { userAtom } from "@/app/atoms/auth";
import http from "@/services/http";
import { countryOptions } from "@/utils/countries";
import { fetchUserIp, } from "@/utils/functions/hotelBookingApi";
import { flightPssengerShema } from "@/utils/validators/flight-passenger-schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  FieldErrors,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import Select from "react-select";

// types.ts
export type PersonType = "adult" | "child" | "infant";

export interface Passenger {
  id: string;
  type: PersonType;
  Title: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  DateOfBirth: string;
  Nationality: string;
  CountryName: string;
  passportNumber: string;
  PassportExpiry: string;
  PassportIssueDate : string;
  PassportIssueCountryCode : string;
  FFAirlineCode : string;
  FFNumber: string;
  needsAssistance: boolean;
  Gender: string;
}

export interface FormValues {
  personInfo: Passenger[];
  contactInfo: {
    region:string;
    countryCode:string;
    phoneNo: string;
    email: string;
  };
  wantOffer: boolean;
}

interface IpDetails {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}


// Helper to generate dynamic person list
const generatePassengers = (counts: Record<PersonType, number>) => {
  const persons: FormValues["personInfo"] = [];
  Object.entries(counts).forEach(([type, count]) => {
    for (let i = 1; i <= count; i++) {
      persons.push({
        id: `${type}-${i}`,
        type: type as PersonType,
        Title: "",
        Gender: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        DateOfBirth: "",
        Nationality: "",
        CountryName: "",
        passportNumber: "",
        PassportExpiry: "",
        PassportIssueDate : "",
        PassportIssueCountryCode : "",
        FFAirlineCode : "",
        FFNumber: "",
        needsAssistance: false,
      });
    }
  });
  return persons;
};

const ErrorMessage = ({ label = "" }: { label?: string }) => (
  <div className="text-sm !text-red-500 absolute -bottom-4.5 left-0.5">
    {label}
  </div>
);

const DynamicForm = ({
  fareQuote,
  passengerCount,
  setPassengerDetails,
}: {
  fareQuote:any;
  passengerCount: any;
  setPassengerDetails: any;
}) => {
  const searchParams = useSearchParams();
  const pnr =  searchParams.get("reissue_pnr");
  const bookingId = searchParams.get("reissue_bookingId");
  const [ticketold, setTicketold] = useState<any>(null);
  const [prefilledIds, setPrefilledIds] = useState<string[]>([]);
  const [validatingAirline, setValidatingAirline] = useState(null);
  const [error, setError] = useState("");
  const [user] = useAtom(userAtom);
  const [isExpanded, setIsExpanded] = useState(true);
  const [collapsedPassengers, setCollapsedPassengers] = useState<{
    [key: string]: boolean;
  }>({});
  const [detailByIp, setDetailByIp] = useState<IpDetails | null>(null);
  const isPassportRequiredAtBook = fareQuote?.IsPassportRequiredAtBook;
  const isPassportRequiredAtTicket = fareQuote?.IsPassportRequiredAtTicket;
  const airlineName = fareQuote?.Segments?.[0]?.[0]?.Airline?.AirlineName;
  const airlineCode = fareQuote?.AirlineCode || "";

  const defaultValues = useMemo<FormValues>(
    () => ({
      personInfo: generatePassengers(passengerCount),
      contactInfo: {
        region: "",
        countryCode: "",
        phoneNo: "",
        email: "",
      },
      wantOffer: false,
    }),
    [passengerCount]
  );

  const methods = useForm<any>({
    defaultValues,
    resolver: yupResolver(flightPssengerShema),
    context: {
    isPassportRequiredAtBook: isPassportRequiredAtBook,
    isPassportRequiredAtTicket: isPassportRequiredAtTicket,
  },
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const { fields } = useFieldArray({
    control,
    name: "personInfo",
  });

  // ✅ Watch the whole personInfo array at once
  const personInfo = useWatch({ control, name: "personInfo" });

  useEffect(() => {
    if (fareQuote?.AirlineCode && fields.length > 0) {
      setValidatingAirline(fareQuote.AirlineCode);
  
      fields.forEach((_, idx) => {
        setValue(`personInfo.${idx}.FFAirlineCode`, fareQuote.AirlineCode || "");
      });
    }
  }, [fareQuote?.AirlineCode, fields, setValue]);

  useEffect(() => {
    const getUserIp = async () => {
      try {
        const data = await fetchUserIp();
        setDetailByIp(data);
      } catch (error) {
        console.error("Error fetching IP:", error);
      }
    };
  
    getUserIp();
  }, []);


  useEffect(() => {
    if (!bookingId || !pnr) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access-token")
        : null;

    http
      .get(
        `/flight/history?bookingid=${bookingId}`,
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined
      )
      .then((res) => {
        const data = res.data.data || res.data;
        setTicketold(data);
        setError("");

        // 🟢 Prefill if passengers exist
        if (data?.passengers?.length) {
          const mappedPassengers: Passenger[] = data.passengers.map(
            (p: any, i: number) => ({
              id: `${p.paxType === 1 ? "adult" : p.paxType === 2 ? "child" : "infant"}-${i + 1}`,
              type: p.paxType === 1 ? "adult" : p.paxType === 2 ? "child" : "infant",
              Title: p.title || "",
              FirstName: p.firstName || "",
              MiddleName: p.MiddleName || "",
              LastName: p.lastName || "",
              Gender:
                p.gender === "1"
                  ? "Male"
                  : p.gender === "2"
                  ? "Female"
                  : "",
              DateOfBirth: p.dateOfBirth
                ? p.dateOfBirth.split("T")[0]
                : "",
              passportNumber: p?.PassportNo || "",
              PassportExpiry: p?.PassportExpiry || "",
              PassportIssueDate : p?.PassportIssueDate || "",
              PassportIssueCountryCode : p?.PassportIssueCountryCode || "",
              FFAirlineCode : airlineCode || "",
              FFNumber: "",
              needsAssistance: false,
            })
          );
          setPrefilledIds(mappedPassengers.map((p) => p.id));
          reset({
            personInfo: mappedPassengers,
            contactInfo: {
              region: data.passengers?.[0]?.region || "",
              countryCode: data.passengers?.[0]?.countryCode || "",
              phoneNo: data.passengers?.[0]?.contactNo || "",
              email: data.passengers?.[0]?.email || "",
            },
            wantOffer: false,
          });
        }
      })
      .catch((err) =>
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Error fetching ticket details"
        )
      );
  }, [bookingId, pnr, reset]);

  const onSubmit = async (data: FormValues) => {
    setPassengerDetails(data);

    // Get first adult's full name
    const firstAdult = data.personInfo.find((p) => p.type === "adult");
    const fullName = firstAdult
      ? `${firstAdult.FirstName} ${firstAdult.LastName}`
      : "";

    const payload = {
      userId: user?.id.toString() || "",
      fullName,
      detail: {
        personInfo: data.personInfo,
        contactInfo: data.contactInfo,
        wantOffer: data.wantOffer,
      },
    };

    await http.post("/passengers/save", payload);
  };

  const togglePassengerCollapse = (passengerId: string) => {
    setCollapsedPassengers((prev) => ({
      ...prev,
      [passengerId]: !prev[passengerId],
    }));
  };

  const getError = (
    errors: FieldErrors<FormValues>,
    index: number,
    field: keyof Passenger
  ): string | undefined => {
    const personErrors = errors.personInfo as
      | FieldErrors<Passenger>[]
      | undefined;
    return personErrors?.[index]?.[field]?.message as string | undefined;
  };

  if (error)
    return (
      <div className="text-red-500 text-center py-4 font-medium">{error}</div>
    );

  return isExpanded ? (
    <div className="passenger-info-expanded">
      {/* Header */}
      <div className="passenger-info-header expanded">
        <div className="header-content">
          <div className="icon-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5.9C12.2758 5.9 12.5489 5.95432 12.8036 6.05985C13.0584 6.16539 13.2899 6.32007 13.4849 6.51508C13.6799 6.71008 13.8346 6.94158 13.9401 7.19636C14.0457 7.45115 14.1 7.72422 14.1 8C14.1 8.27578 14.0457 8.54885 13.9401 8.80364C13.8346 9.05842 13.6799 9.28992 13.4849 9.48492C13.2899 9.67993 13.0584 9.83461 12.8036 9.94015C12.5489 10.0457 12.2758 10.1 12 10.1C11.443 10.1 10.9089 9.87875 10.5151 9.48492C10.1212 9.0911 9.9 8.55695 9.9 8C9.9 7.44305 10.1212 6.9089 10.5151 6.51508C10.9089 6.12125 11.443 5.9 12 5.9ZM12 14.9C14.97 14.9 18.1 16.36 18.1 17V18.1H5.9V17C5.9 16.36 9.03 14.9 12 14.9ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13Z"
                fill="#014569"
              />
            </svg>
          </div>
          <span className="header-title">Passenger Information</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="collapse-button"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 12L16 20L24 12"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="passenger-info-content">
        {/* Information Banner */}
        <div className="info-banner">
          <div className="info-icon">
            <span>i</span>
          </div>
          <div className="info-text">
            <span>
              For immigration and security reasons, enter names exactly as they
              appear on your passport.
            </span>
            <button className="read-more-btn">Read more</button>
          </div>
        </div>

        {/* Passenger Main form */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="passengers-section">
              {fields.map((field: any, idx) => {
                const FirstName = personInfo?.[idx]?.FirstName;
                const LastName = personInfo?.[idx]?.LastName;
                const keyForCollapse = `${field.type}-${idx}`;
                return (
                  <div key={field.id} className="passenger-form-section">
                    <div className="passenger-header">
                      <button
                        type="button"
                        onClick={() => togglePassengerCollapse(keyForCollapse)}
                        className={`passenger-header-button ${
                          collapsedPassengers[keyForCollapse] ? "collapsed" : ""
                        }`}
                      >
                        <h3 className="passenger-title capitalize">
                          {field.type} -{" "}
                          {
                            methods
                              .getValues(`personInfo.${idx}.id`)
                              ?.split("-")[1]
                          }
                        </h3>
                        <div className="passenger-header-actions">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`collapse-icon ${
                              collapsedPassengers[keyForCollapse]
                                ? "collapsed"
                                : ""
                            }`}
                          >
                            <path
                              d="M7 14L12 9L17 14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </button>
                    </div>

                    {!collapsedPassengers[keyForCollapse] && (
                      <div className="passenger-form-content">
                        {/* Basic Information Row */}
                        <div className="form-row">
                          {/* Title Dropdown */}
                          <div className="relative w-1/4">
                            <select
                              {...register(`personInfo.${idx}.Title`, {
                                required: "Title is required",
                                 onChange: (e) => {
                                  const selectedTitle = e.target.value;
                                  let gender = "";
                                  if (selectedTitle === "Mr" || selectedTitle === "Mstr") gender = "Male";
                                  else if (selectedTitle === "Mrs" || selectedTitle === "Ms") gender = "Female";
                                  else gender = "";
                                  setValue(`personInfo.${idx}.Gender`, gender);
                                },
                              })}
                              className="form-select"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Select Title
                              </option>
                             {field.type === "adult" && (
                                <>
                                  <option value="Mr">Mr</option>
                                  <option value="Mrs">Mrs</option>
                                  <option value="Ms">Ms</option>
                                </>
                              )}
                          
                              {field.type === "child" && (
                                <>
                                  <option value="Mr">Mr</option>
                                  <option value="Ms">Ms</option>
                                </>
                              )}
                          
                              {field.type === "infant" && (
                                <>
                                  <option value="Mstr">Mstr</option>
                                  <option value="Mr">Mr</option>
                                  <option value="Ms">Ms</option>
                                </>
                              )}
                            </select>
                            <ErrorMessage
                              label={getError(errors, idx, "Title")}
                            />
                          </div>

                          <div className="name-input-group">
                            <input
                              {...register(`personInfo.${idx}.FirstName`)}
                              placeholder="First Name"
                              className="form-input flex-1"
                              disabled={prefilledIds.includes(field.id)}
                            />
                            {FirstName && (
                              <button
                                className="clear-input-btn"
                                onClick={() =>
                                  setValue(`personInfo.${idx}.FirstName`, "")
                                }
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12 2C6.47 2 2 6.97 2 12C2 18.03 6.47 22 12 22C17.53 22 22 18.03 22 12C22 6.97 17.53 2 12 2ZM12 20C7.59 20 4 16.91 4 12C4 8.09 7.59 4 12 4C16.41 4 20 8.09 20 12C20 16.91 16.41 20 12 20ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"
                                    fill="black"
                                    opacity="0.6"
                                  />
                                </svg>
                              </button>
                            )}
                            <ErrorMessage
                              label={getError(errors, idx, "FirstName")}
                            />
                          </div>

                          <div className="name-input-group">
                            <input
                              {...register(`personInfo.${idx}.MiddleName`)}
                              placeholder="Middle Name"
                              className="form-input flex-1"
                              disabled={prefilledIds.includes(field.id)}
                            />
                            {FirstName && (
                              <button
                                className="clear-input-btn"
                                onClick={() =>
                                  setValue(`personInfo.${idx}.MiddleName`, "")
                                }
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12 2C6.47 2 2 6.97 2 12C2 18.03 6.47 22 12 22C17.53 22 22 18.03 22 12C22 6.97 17.53 2 12 2ZM12 20C7.59 20 4 16.91 4 12C4 8.09 7.59 4 12 4C16.41 4 20 8.09 20 12C20 16.91 16.41 20 12 20ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"
                                    fill="black"
                                    opacity="0.6"
                                  />
                                </svg>
                              </button>
                            )}
                            <ErrorMessage
                              label={getError(errors, idx, "MiddleName")}
                            />
                          </div>

                          <div className="name-input-group">
                            <input
                              {...register(`personInfo.${idx}.LastName`)}
                              placeholder="Last Name"
                              className="form-input flex-1"
                              disabled={prefilledIds.includes(field.id)}
                            />
                            {LastName && (
                              <button
                                className="clear-input-btn"
                                onClick={() =>
                                  setValue(`personInfo.${idx}.LastName`, "")
                                }
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12 2C6.47 2 2 6.97 2 12C2 18.03 6.47 22 12 22C17.53 22 22 18.03 22 12C22 6.97 17.53 2 12 2ZM12 20C7.59 20 4 16.91 4 12C4 8.09 7.59 4 12 4C16.41 4 20 8.09 20 12C20 16.91 16.41 20 12 20ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"
                                    fill="black"
                                    opacity="0.6"
                                  />
                                </svg>
                              </button>
                            )}
                            <ErrorMessage
                              label={getError(errors, idx, "LastName")}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          {/*Nationality drop[down] */}

                          <div className="relative w-1/4">
                            <Controller
                               name={`personInfo.${idx}.Nationality`}
                               control={control}
                               rules={{ required: "Nationality is required" }}
                               render={({ field, fieldState }) => (
                                 <>
                                   <Select
                                     {...field}
                                     {...register(`personInfo.${idx}.Nationality`, {
                                       required: "Nationality is required",
                                     })}
                                     value={
                                      countryOptions.find(
                                        (option) => option.value === watch(`personInfo.${idx}.Nationality`)
                                      ) || null
                                    }
                                     options={countryOptions}
                                     placeholder="Select Nationality"
                                     isSearchable
                                     formatOptionLabel={(option) => (
                                       <div className="flex items-center gap-2">
                                         <span className="text-lg">{option.flag}</span>
                                         <span>{option.name}</span>
                                       </div>
                                     )}
                                    onChange={(selected) => {
                                       setValue(`personInfo.${idx}.Nationality`, selected?.value || "");
                                       setValue(`personInfo.${idx}.CountryName`, selected?.name || "");
                                     }}
                                     className="text-sm"
                                     styles={{
                                       control: (base, state) => ({
                                         ...base,
                                         borderColor: state.isFocused
                                           ? "#3b82f6"
                                           : fieldState.error
                                           ? "red"
                                           : "#d1d5db",
                                         boxShadow: "none",
                                         "&:hover": { borderColor: "#3b82f6" },
                                       }),
                                     }}
                                   />
                                    <ErrorMessage
                                      label={getError(errors, idx, "Nationality")}
                                    />
                                 </>
                               )}
                             />
                          </div>

                          {/* <div className="">
                            <input
                              {...register(`personInfo.${idx}.Gender`, {
                              })}
                              readOnly
                              className="form-input bg-gray-100 text-gray-700 cursor-not-allowed"
                              placeholder="Gender"
                              value={watch(`personInfo.${idx}.Gender`) || ""}
                            />
                            <ErrorMessage label={getError(errors, idx, "Gender")} />
                          </div> */}

                          {/* Date of Birth */}
                          <div className="date-of-birth-container relative w-1/4">
                            <input
                              type="date"
                              {...register(`personInfo.${idx}.DateOfBirth`)}
                              max={new Date().toISOString().split("T")[0]}
                              className="form-input passport-input"
                              placeholder="Select of DOB"
                              disabled={prefilledIds.includes(field.id)}
                            />

                            <ErrorMessage
                              label={getError(errors, idx, "DateOfBirth")}
                            />
                          </div>       
                        </div>

                        {/* Passport Details - Expandable */}
                        <div className="expandable-section">
                          <button
                            type="button"
                            onClick={() =>
                              togglePassengerCollapse(
                                `passport-${keyForCollapse}`
                              )
                            }
                            className="flex gap-4"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              className={`toggle-icon ${
                                collapsedPassengers[
                                  `passport-${keyForCollapse}`
                                ]
                                  ? "expanded"
                                  : ""
                              }`}
                            >
                              <path
                                d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                                fill="black"
                                opacity="0.8"
                              />
                            </svg>
                            <span>Add passport details</span>
                            <ErrorMessage
                                label={getError(errors, idx, "passportNumber")}
                              />
                          </button>

                          {collapsedPassengers[
                            `passport-${keyForCollapse}`
                          ] && (<>
                            <div className="relative expanded-content">
                              <input
                                placeholder="Add passport number"
                                {...register(
                                  `personInfo.${idx}.passportNumber`
                                )}
                                disabled={prefilledIds.includes(field.id)}
                                className="form-input passport-input"
                              />
                              <ErrorMessage
                                label={getError(errors, idx, "passportNumber")}
                              />
                            </div>

                            <div className="relative expanded-content">
                              <span>Add passport Issue Date</span>
                              <input
                                type="date"
                                placeholder="Passport Issue Date"
                                {...register(
                                  `personInfo.${idx}.PassportIssueDate`
                                )}
                                max={new Date().toISOString().split("T")[0]}
                                disabled={prefilledIds.includes(field.id)}
                                className="form-input passport-input"
                              />
                              <ErrorMessage
                                label={getError(errors, idx, "PassportIssueDate")}
                              />
                            </div>

                            <div className="relative expanded-content">
                              <span>Add passport Expiry Date</span>
                              <input
                                type="date"
                                placeholder="Passport Expiry Date"
                                {...register(
                                  `personInfo.${idx}.PassportExpiry`
                                )}
                                disabled={prefilledIds.includes(field.id)}
                                className="form-input passport-input"
                              />
                              <ErrorMessage
                                label={getError(errors, idx, "PassportExpiry")}
                              />
                            </div>

                            <div className="relative expanded-content">
                            <Controller
                               name={`personInfo.${idx}.PassportIssueCountryCode`}
                               control={control}
                               rules={{ required: "PassportIssueCountryCode is required" }}
                               render={({ field, fieldState }) => (
                                 <>
                                   <Select
                                     {...field}
                                     {...register(`personInfo.${idx}.PassportIssueCountryCode`, {
                                       required: "PassportIssueCountryCode is required",
                                     })}
                                     value={
                                      countryOptions.find(
                                        (option) => option.value === watch(`personInfo.${idx}.PassportIssueCountryCode`)
                                      ) || null
                                    }
                                     options={countryOptions}
                                     placeholder="Select PassportIssueCountryCode"
                                     isSearchable
                                     formatOptionLabel={(option) => (
                                       <div className="flex items-center gap-2">
                                         <span className="text-lg">{option.flag}</span>
                                         <span>{option.name}</span>
                                       </div>
                                     )}
                                    onChange={(selected) => {
                                       setValue(`personInfo.${idx}.PassportIssueCountryCode`, selected?.value || "");
                                     }}
                                     className="text-sm"
                                     styles={{
                                       control: (base, state) => ({
                                         ...base,
                                         borderColor: state.isFocused
                                           ? "#3b82f6"
                                           : fieldState.error
                                           ? "red"
                                           : "#d1d5db",
                                         boxShadow: "none",
                                         "&:hover": { borderColor: "#3b82f6" },
                                       }),
                                     }}
                                   />
                                    <ErrorMessage
                                      label={getError(errors, idx, "PassportIssueCountryCode")}
                                    />
                                 </>
                               )}
                             />
                          </div>
                            </>
                          )}
                        </div>

                        {/* Flyer Membership - Expandable */}
                        <div className="expandable-section">
                          <button
                            type="button"
                            onClick={() =>
                              togglePassengerCollapse(`flyer-${keyForCollapse}`)
                            }
                            className="flex gap-4"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              className={`toggle-icon ${
                                collapsedPassengers[`flyer-${keyForCollapse}`]
                                  ? "expanded"
                                  : ""
                              }`}
                            >
                              <path
                                d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                                fill="black"
                                opacity="0.8"
                              />
                            </svg>
                            <span>Flyer membership number</span>
                          </button>

                          {collapsedPassengers[`flyer-${keyForCollapse}`] && (
                            <>
                            <div className="relative expanded-content">
                              <input
                                // {...register(
                                //   `personInfo.${idx}.FFAirlineCode`
                                // )}
                                defaultValue={airlineName || ""}
                                readOnly  
                                placeholder={airlineName}
                                className="form-input flyer-input bg-gray-100 text-gray-700 cursor-not-allowed"
                              />
                              <ErrorMessage
                                label={getError(errors, idx, "FFAirlineCode")}
                              />
                            </div>
                            <div className="relative expanded-content">
                              <input
                                {...register(
                                  `personInfo.${idx}.FFNumber`
                                )}
                                disabled={prefilledIds.includes(field.id)}
                                placeholder="Flyer Membership"
                                className="form-input flyer-input"
                              />
                              <ErrorMessage
                                label={getError(errors, idx, "FFNumber")}
                              />
                            </div>
                            </>
                          )}
                        </div>

                        {/* Special Assistance */}
                        {/* <div className="expandable-section">
                          <label>
                            <input
                              type="checkbox"
                              {...register(`personInfo.${idx}.needsAssistance`)}
                            />
                            &nbsp;Needs Assistance
                          </label>
                        </div> */}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contact Information */}
            <div className="contact-section mt-4">
              <h3 className="section-title">Contact information</h3>
              <div className="contact-form">
                <div className="contact-row">
                  <div className="country-code-dropdown">
                    <select
                      {...register("contactInfo.countryCode", { required: "Country code is required" })}
                      defaultValue="+91"
                      className="form-select pr-8"
                    >
                      <option value="" disabled>Cell code</option>
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="dropdown-icon"
                    >
                      <path d="M7 10L12 15L17 10H7Z" fill="black" />
                    </svg>
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Contact number"
                      {...register("contactInfo.phoneNo")}
                      className="form-input contact-input"
                    />
                    <ErrorMessage
                      label={(errors.contactInfo as any)?.phoneNo?.message}
                    />
                  </div>

                  <div className="relative">
                    <input
                      placeholder="Email address"
                      {...register("contactInfo.email")}
                      className="form-input flex-1"
                    />
                    <ErrorMessage
                      label={(errors.contactInfo as any)?.email?.message}
                    />
                  </div>
                </div>

                <div className="contact-row">
                  <div className="relative">
                    <div className="relative">
                       <label className="flex items-center gap-2 mb-2">
                       <input
                         type="checkbox"
                         onChange={(e) => {
                           if (e.target.checked && detailByIp?.region) {
                             setValue("contactInfo.region", detailByIp.region, { shouldValidate: true });
                           }
                         }}
                       />
                       <span>Confirm your region</span>
                     </label>
                      <input
                        defaultValue={detailByIp?.region || ""}
                        {...register("contactInfo.region", {
                           required: "Region is required",
                           onBlur: () => {
                             const currentValue = getValues("contactInfo.region");
                             if (!currentValue?.trim() && detailByIp?.region) {
                               setValue("contactInfo.region", detailByIp.region);
                             }
                           },
                         })}
                        className="form-input contact-input"
                        placeholder={detailByIp?.region}
                      />
                       <ErrorMessage
                      label={(errors.contactInfo as any)?.region?.message}
                    />
                    </div>

                  </div>

                  {/* <div className="relative">
                    <input
                      placeholder="Email address"
                      {...register("contactInfo.email")}
                      className="form-input flex-1"
                    />
                    <ErrorMessage
                      label={(errors.contactInfo as any)?.email?.message}
                    />
                  </div> */}
                </div>

                {/* Newsletter Subscription */}
                <div className="newsletter-subscription">
                  <label className="subscription-text">
                    <input
                      className={`subscription-checkbox ${
                        true ? "checked" : ""
                      }`}
                      type="checkbox"
                      {...register("wantOffer")}
                    />
                    &nbsp;I would like to receive exclusive offers and news from
                    Travulu. I am aware that I can unsubscribe at any time.
                  </label>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button className="continue-button" type="submit">
              <span>Save</span>
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  ) : (
    <div className="passenger-info-collapsed">
      <button
        onClick={() => setIsExpanded(true)}
        className="passenger-info-header"
      >
        <div className="header-content">
          <div className="icon-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5.9C12.2758 5.9 12.5489 5.95432 12.8036 6.05985C13.0584 6.16539 13.2899 6.32007 13.4849 6.51508C13.6799 6.71008 13.8346 6.94158 13.9401 7.19636C14.0457 7.45115 14.1 7.72422 14.1 8C14.1 8.27578 14.0457 8.54885 13.9401 8.80364C13.8346 9.05842 13.6799 9.28992 13.4849 9.48492C13.2899 9.67993 13.0584 9.83461 12.8036 9.94015C12.5489 10.0457 12.2758 10.1 12 10.1C11.443 10.1 10.9089 9.87875 10.5151 9.48492C10.1212 9.0911 9.9 8.55695 9.9 8C9.9 7.44305 10.1212 6.9089 10.5151 6.51508C10.9089 6.12125 11.443 5.9 12 5.9ZM12 14.9C14.97 14.9 18.1 16.36 18.1 17V18.1H5.9V17C5.9 16.36 9.03 14.9 12 14.9ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13Z"
                fill="#014569"
              />
            </svg>
          </div>
          <span className="header-title">Passenger Information</span>
        </div>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="expand-icon"
        >
          <path
            d="M8 20L16 12L24 20"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default DynamicForm;
