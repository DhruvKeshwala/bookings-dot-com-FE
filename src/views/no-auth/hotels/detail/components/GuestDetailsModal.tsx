"use client";
import { GuestDetailsModalProps } from "@/types/hotel.types";
import React from "react";

const GuestDetailsModal: React.FC<GuestDetailsModalProps> = ({
  isOpen,
  onClose,
  guestDetails,
  onGuestDetailChange,
  onAddAdult,
  onProceedToPay,
  validationInfo,
  arrivalTransportType,
  setArrivalTransportType,
  transportInfoId,
  setTransportInfoId,
  time,
  setTime,
  departureTransportType,
  setDepartureTransportType,
  departureTransportInfoId,
  setDepartureTransportInfoId,
  departureTime,
  setDepartureTime,
  bookingOption,
  hasSelectedRefundableRoom = false
}) => {
  if (!isOpen) return null;

  const hotelSearchDataRaw = sessionStorage.getItem("hotelSearchData");
  const hotelSearchData = hotelSearchDataRaw ? JSON.parse(hotelSearchDataRaw) : null;
  const hasSpecialChar = (str: string) => /[^a-zA-Z0-9 ]/.test(str);
  const hasSpace = (str: string) => str.includes(" ");

  const getFirstNameError = (name: string, isChild = false): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    if (isChild) {
      if (trimmed.length < 2) {
        return "First name must be at least 5 characters.";
      }
    } else {
      if (trimmed.length < 5) {
        return "First name must be at least 5 characters.";
      }
    }

    if (validationInfo.CharLimit) {
      if (trimmed.length < validationInfo.PaxNameMinLength) {
        return `First name must be at least ${validationInfo.PaxNameMinLength} characters.`;
      }
      if (trimmed.length > validationInfo.PaxNameMaxLength) {
        return `First name must be less than ${validationInfo.PaxNameMaxLength} characters.`;
      }
    }

    if (!validationInfo.SpaceAllowed && hasSpace(trimmed)) {
      return "Spaces are not allowed.";
    }

    if (!validationInfo.SpecialCharAllowed && hasSpecialChar(trimmed)) {
      return "Special characters are not allowed.";
    }

    return null;
  };


  const getLastNameError = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    if (validationInfo.CharLimit && trimmed.length > validationInfo.PaxNameMaxLength) {
      return `Last name must be less than ${validationInfo.PaxNameMaxLength} characters.`;
    }

    if (!validationInfo.SpaceAllowed && hasSpace(trimmed)) {
      return "Spaces are not allowed.";
    }

    if (!validationInfo.SpecialCharAllowed && hasSpecialChar(trimmed)) {
      return "Special characters are not allowed.";
    }

    return null;
  };

  const isNameValid = (name: string, type: "firstName" | "lastName", isChild = false): boolean => {
    if (type === "firstName") {
      return !getFirstNameError(name, isChild);
    } else {
      return !getLastNameError(name);
    }
  };

  const hasDuplicateFirstNames = (peopleList: any, currentPersonId: any) => {
    if (validationInfo.SamePaxNameAllowed) return false;

    // Get the current guest
    const currentGuest = peopleList.find((person: any) => person.id === currentPersonId);
    if (!currentGuest) return false;

    const currentFirstName = currentGuest.firstName.trim().toLowerCase();

    // Find the index of the current guest in the peopleList
    const currentIndex = peopleList.findIndex((person: any) => person.id === currentPersonId);

    // Check if this first name appears in any guest **before** currentIndex
    for (let i = 0; i < currentIndex; i++) {
      const guestFirstName = peopleList[i].firstName.trim().toLowerCase();
      if (guestFirstName === currentFirstName) {
        return true;
      }
    }
    return false;
  }

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isPanValid = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

  const isAdultValid = (adult: any, index: number) => {
    if (!adult.title || !adult.firstName || !adult.lastName || !adult.dateOfBirth) return false;

    if (!isNameValid(adult.firstName, "firstName")) return false;
    if (!isNameValid(adult.lastName, "lastName")) return false;

    const age = calculateAge(adult.dateOfBirth);
    if (age <= 18) return false;

    const isPanRequired = validationInfo?.PanMandatory && index < (validationInfo?.PanCountRequired || 0);
    if (isPanRequired && !isPanValid(adult.panNumber)) return false;

    if (hasDuplicateFirstNames(guestDetails.adults, adult.id)) {
      return false;
    }

    return true;
  };

  const isChildValid = (child: any, index: number) => {
    if (!child.title || !child.firstName || !child.lastName || !child.dateOfBirth) return false;

    if (!isNameValid(child.firstName, "firstName", validationInfo)) return false;
    if (!isNameValid(child.lastName, "lastName", validationInfo)) return false;

    const age = calculateAge(child.dateOfBirth);
    const expectedAge = parseInt(hotelSearchData?.guestsData?.childrenAges?.[index] || "-1");
    if (age !== expectedAge) return false;
    if (validationInfo?.PanMandatory && !isPanValid(child.panNumber)) return false;
    if (hasDuplicateFirstNames(guestDetails.children, child.id)) {
      return false;
    }
    return true;
  };

  const allAdultsValid = guestDetails.adults.every((adult, index) => isAdultValid(adult, index));
  const allChildrenValid = guestDetails.children.every((child, index) => isChildValid(child, index));

  const duplicateAdultNamesFound = guestDetails.adults.some(adult =>
    hasDuplicateFirstNames(guestDetails.adults, adult.id)
  );

  const duplicateChildNamesFound = guestDetails.children.some(child =>
    hasDuplicateFirstNames(guestDetails.children, child.id)
  );

  const formValid = allAdultsValid && allChildrenValid && !duplicateAdultNamesFound && !duplicateChildNamesFound;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold font-nunito text-black">Guest Details</h2>
              <p className="text-sm text-gray-600 mt-1">
                {guestDetails.adults.length} of {hotelSearchData?.guestsData?.adults || 1} adult(s)
                added
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-8 h-8 text-[#001F50]"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 2C8.2 2 2 8.2 2 16C2 23.8 8.2 30 16 30C23.8 30 30 23.8 30 16C30 8.2 23.8 2 16 2ZM21.4 23L16 17.6L10.6 23L9 21.4L14.4 16L9 10.6L10.6 9L16 14.4L21.4 9L23 10.6L17.6 16L23 21.4L21.4 23Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {/* Adults */}
          <div className="space-y-6">
            {guestDetails.adults.map((adult, index) => {
              const isPanRequired = validationInfo?.PanMandatory && index < (validationInfo?.PanCountRequired || 0);

              return (
                <div key={adult.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-xl font-bold font-nunito text-black mb-6">Adult {adult.id}</h3>

                  <div className="flex flex-col lg:flex-row gap-6 mb-6">
                    {/* Title Dropdown */}
                    <div className="flex flex-col w-full lg:w-auto">
                      <select
                        value={adult.title}
                        onChange={(e) =>
                          onGuestDetailChange(adult.id, "title", e.target.value, "adult")
                        }
                        className="w-full lg:w-28 px-3 py-3 border border-gray-300 rounded-lg bg-white text-lg font-medium text-black focus:outline-none"
                      >
                        <option value="">Title</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>

                    {/* First Name */}
                    <div className="flex flex-col flex-1">
                      <input
                        type="text"
                        placeholder="First name"
                        value={adult.firstName}
                        onChange={(e) =>
                          onGuestDetailChange(adult.id, "firstName", e.target.value, "adult")
                        }
                        className="px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />
                      {adult.firstName && getFirstNameError(adult.firstName, false) && (
                        <p className="text-sm text-red-500 mt-1">
                          {getFirstNameError(adult.firstName, false)}
                        </p>
                      )}
                      {adult.firstName && hasDuplicateFirstNames(guestDetails.adults, adult.id) && (
                        <p className="text-sm text-red-500 mb-4">
                          Duplicate names are not allowed.
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col flex-1">
                      <input
                        type="text"
                        placeholder="Last name"
                        value={adult.lastName}
                        onChange={(e) =>
                          onGuestDetailChange(adult.id, "lastName", e.target.value, "adult")
                        }
                        className="px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />
                      {adult.lastName && getLastNameError(adult.lastName) && (
                        <p className="text-sm text-red-500 mt-1">
                          {getLastNameError(adult.lastName)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DOB + Validation */}
                  {(() => {
                    const dobAge = adult.dateOfBirth ? calculateAge(adult.dateOfBirth) : null;
                    const ageInvalid = dobAge !== null && dobAge <= 18;

                    return (
                      <>
                        <input
                          type="date"
                          value={adult.dateOfBirth}
                          onChange={(e) =>
                            onGuestDetailChange(adult.id, "dateOfBirth", e.target.value, "adult")
                          }
                          className={`w-full lg:w-64 px-3 py-3 border rounded-lg text-lg ${ageInvalid ? "border-red-500" : "border-gray-300"
                            }`}
                        />
                        {ageInvalid && (
                          <p className="text-sm text-red-500 mt-1">
                            Age must be above 18 years for adults. Current age: {dobAge}
                          </p>
                        )}
                      </>
                    );
                  })()}

                  {/* PAN for Adults (only show if required) */}
                  {isPanRequired && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="PAN Number"
                        value={adult.panNumber ?? ""}
                        onChange={(e) =>
                          onGuestDetailChange(adult.id, "panNumber", e.target.value, "adult")
                        }
                        className={`w-full px-3 py-3 border rounded-lg text-lg ${adult.panNumber && !isPanValid(adult.panNumber)
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      />
                      {adult.panNumber && !isPanValid(adult.panNumber) && (
                        <p className="text-sm text-red-500 mt-1">
                          Please enter a valid PAN (e.g. ABCDE1234F).
                        </p>
                      )}
                    </div>
                  )}

                  {validationInfo?.PassportMandatory && (
                    <div className="mt-4 space-y-4">
                      {/* Passport No */}
                      <input
                        type="text"
                        placeholder="Passport Number"
                        value={adult.passportNo ?? ""}
                        onChange={(e) =>
                          onGuestDetailChange(adult.id, "passportNo", e.target.value, "adult")
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />

                      {/* Passport Issue Date */}
                      <input
                        type="date"
                        value={adult.passportIssueDate ?? ""}
                        onChange={(e) =>
                          onGuestDetailChange(adult.id, "passportIssueDate", e.target.value, "adult")
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />

                      {/* Passport Expiry Date */}
                      <input
                        type="date"
                        value={adult.passportExpDate ?? ""}
                        onChange={(e) =>
                          onGuestDetailChange(adult.id, "passportExpDate", e.target.value, "adult")
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Adult Button */}
            {guestDetails.adults.length < (hotelSearchData?.guestsData?.adults || 1) && (
              <button
                onClick={onAddAdult}
                className="flex items-center gap-2 text-black font-medium hover:underline"
              >
                ➕ Add person details
              </button>
            )}

            {/* Children */}
            {guestDetails.children.map((child, index) => {
              const dobAge = child.dateOfBirth ? calculateAge(child.dateOfBirth) : null;
              const expectedAge = parseInt(
                hotelSearchData?.guestsData?.childrenAges?.[index] || "-1"
              );
              const ageMismatch = dobAge !== null && dobAge !== expectedAge;

              return (
                <div
                  key={child.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <h3 className="text-xl font-bold font-nunito text-black mb-6">
                    Child {child.id}
                  </h3>

                  <div className="flex flex-col lg:flex-row gap-6 mb-6">
                    {/* Title */}
                    <div className="flex flex-col w-full lg:w-auto">
                      <select
                        value={child.title}
                        onChange={(e) =>
                          onGuestDetailChange(child.id, "title", e.target.value, "child")
                        }
                        className="w-full lg:w-28 px-3 py-3 border border-gray-300 rounded-lg bg-white text-lg font-medium text-black focus:outline-none"
                      >
                        <option value="">Title</option>
                        <option value="Master">Master</option>
                        <option value="Miss">Miss</option>
                      </select>
                    </div>

                    {/* First Name */}
                    <div className="flex flex-col flex-1">
                      <input
                        type="text"
                        placeholder="First name"
                        value={child.firstName}
                        onChange={(e) =>
                          onGuestDetailChange(child.id, "firstName", e.target.value, "child")
                        }
                        className="px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />
                      {child.firstName && getFirstNameError(child.firstName, true) && (
                        <p className="text-sm text-red-500 mt-1">
                          {getFirstNameError(child.firstName, true)}
                        </p>
                      )}
                      {child.firstName && hasDuplicateFirstNames(guestDetails.children, child.id) && (
                        <p className="text-sm text-red-500 mb-4">
                          Duplicate names are not allowed.
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col flex-1">
                      <input
                        type="text"
                        placeholder="Last name"
                        value={child.lastName}
                        onChange={(e) =>
                          onGuestDetailChange(child.id, "lastName", e.target.value, "child")
                        }
                        className="px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />
                      {child.lastName && getLastNameError(child.lastName) && (
                        <p className="text-sm text-red-500 mt-1">
                          {getLastNameError(child.lastName)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DOB */}
                  <input
                    type="date"
                    value={child.dateOfBirth}
                    onChange={(e) =>
                      onGuestDetailChange(child.id, "dateOfBirth", e.target.value, "child")
                    }
                    className={`w-full lg:w-64 px-3 py-3 border rounded-lg text-lg ${ageMismatch ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {ageMismatch && (
                    <p className="text-sm text-red-500 mt-1">
                      Age does not match expected age ({expectedAge} years).
                    </p>
                  )}

                  {/* 📘 Passport fields (if required) */}
                  {validationInfo?.PassportMandatory && (
                    <div className="mt-4 space-y-4">
                      {/* Passport Number */}
                      <input
                        type="text"
                        placeholder="Passport Number"
                        value={child.passportNo ?? ""}
                        onChange={(e) =>
                          onGuestDetailChange(child.id, "passportNo", e.target.value, "child")
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />

                      {/* Passport Issue Date */}
                      <input
                        type="date"
                        value={child.passportIssueDate ?? ""}
                        onChange={(e) =>
                          onGuestDetailChange(child.id, "passportIssueDate", e.target.value, "child")
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />

                      {/* Passport Expiry Date */}
                      <input
                        type="date"
                        value={child.passportExpDate ?? ""}
                        onChange={(e) =>
                          onGuestDetailChange(child.id, "passportExpDate", e.target.value, "child")
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-lg"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {validationInfo?.PackageDetailsMandatory && (
            <div className="mb-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-black">Arrival Transport Details</h3>

              <div className="mb-4">
                <label className="block mb-1 font-medium text-black">Arrival Transport Type</label>
                <select
                  value={arrivalTransportType ?? ""}
                  onChange={(e) => setArrivalTransportType(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Transport Type</option>
                  <option value={0}>Flight</option>
                  <option value={1}>Surface</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium text-black">Transport Info ID</label>
                <input
                  type="text"
                  value={transportInfoId}
                  onChange={(e) => setTransportInfoId(e.target.value)}
                  placeholder="Transfer Details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-black">Time</label>
                <input
                  type="datetime-local"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {validationInfo?.DepartureDetailsMandatory && (
            <div className="mb-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-black">Departure Transport Details</h3>

              <div className="mb-4">
                <label className="block mb-1 font-medium text-black">Departure Transport Type</label>
                <select
                  value={departureTransportType ?? ""}
                  onChange={(e) => setDepartureTransportType(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Transport Type</option>
                  <option value={0}>Flight</option>
                  <option value={1}>Surface</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium text-black">Transport Info ID</label>
                <input
                  type="text"
                  value={departureTransportInfoId}
                  onChange={(e) => setDepartureTransportInfoId(e.target.value)}
                  placeholder="Transfer Details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-black">Time</label>
                <input
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onProceedToPay}
              disabled={!formValid}
              className={`w-full px-8 py-4 text-white text-lg font-medium rounded-xl transition duration-200 ${formValid ? "bg-[#FF7F50] hover:bg-[#FF5555]" : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              {(bookingOption === "reserve" && hasSelectedRefundableRoom) ? "Book Now" : "Proceed to Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDetailsModal;