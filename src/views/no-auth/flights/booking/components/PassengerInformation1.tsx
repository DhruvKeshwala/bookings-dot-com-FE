"use client";

import { useState } from "react";

type PassengerType = "adult" | "child" | "infant";

interface PassengerData {
  id: string;
  type: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  PassportExpiry?: string;
  flyerMembership?: string;
  needsAssistance?: boolean;
}

interface ContactData {
  countryCode: string;
  phoneNumber: string;
  email: string;
  receiveOffers: boolean;
}

export default function PassengerInformation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [passengerCount, setPassengerCount] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [passengers, setPassengers] = useState<PassengerData[]>([
    {
      id: "adult-1",
      type: "adult",
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportNumber: "",
      flyerMembership: "",
      needsAssistance: false,
    },
  ]);
  const [contactInfo, setContactInfo] = useState<ContactData>({
    countryCode: "+91",
    phoneNumber: "",
    email: "",
    receiveOffers: false,
  });
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [collapsedPassengers, setCollapsedPassengers] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const togglePassengerCollapse = (passengerId: string) => {
    setCollapsedPassengers((prev) => ({
      ...prev,
      [passengerId]: !prev[passengerId],
    }));
  };

  const updatePassengerData = (
    passengerId: string,
    field: keyof PassengerData,
    value: string | boolean
  ) => {
    setPassengers((prev) =>
      prev.map((passenger) =>
        passenger.id === passengerId
          ? { ...passenger, [field]: value }
          : passenger
      )
    );
  };

  const addPassenger = (type: PassengerType) => {
    const countKey =
      type === "adult" ? "adults" : type === "child" ? "children" : "infants";
    const newCount = passengerCount[countKey] + 1;
    const newId = `${type}-${newCount}`;

    const newPassenger: PassengerData = {
      id: newId,
      type,
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportNumber: "",
      PassportExpiry: "",
      flyerMembership: "",
      needsAssistance: false,
    };

    setPassengers((prev) => [...prev, newPassenger]);
    setPassengerCount((prev) => ({
      ...prev,
      [countKey]: newCount,
    }));
  };

  const removePassenger = (passengerId: string) => {
    const passenger = passengers.find((p) => p.id === passengerId);
    if (
      !passenger ||
      (passenger.type === "adult" && passengerCount.adults <= 1)
    )
      return;

    setPassengers((prev) => prev.filter((p) => p.id !== passengerId));
    const countKey =
      passenger.type === "adult"
        ? "adults"
        : passenger.type === "child"
        ? "children"
        : "infants";
    setPassengerCount((prev) => ({
      ...prev,
      [countKey]: prev[countKey] - 1,
    }));

    // Clean up expanded sections
    setExpandedSections((prev) => {
      const newState = { ...prev };
      delete newState[`passport-${passengerId}`];
      delete newState[`flyer-${passengerId}`];
      return newState;
    });
    setCollapsedPassengers((prev) => {
      const newState = { ...prev };
      delete newState[passengerId];
      return newState;
    });
  };

  const getPassengerLabel = (passenger: PassengerData) => {
    const typePassengers = passengers.filter((p) => p.type === passenger.type);
    const index = typePassengers.findIndex((p) => p.id === passenger.id) + 1;
    const typeLabel =
      passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1);
    return `${typeLabel} ${index}`;
  };

  const PassengerForm = ({ passenger }: { passenger: PassengerData }) => (
    <div className="passenger-form-section">
      <div className="passenger-header">
        <button
          onClick={() => togglePassengerCollapse(passenger.id)}
          className={`passenger-header-button ${
            collapsedPassengers[passenger.id] ? "collapsed" : ""
          }`}
        >
          <h3 className="passenger-title">{getPassengerLabel(passenger)}</h3>
          <div className="passenger-header-actions">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className={`collapse-icon ${
                collapsedPassengers[passenger.id] ? "collapsed" : ""
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
        {passengers.length > 1 &&
          !(passenger.type === "adult" && passengerCount.adults <= 1) && (
            <button
              onClick={() => removePassenger(passenger.id)}
              className="remove-passenger-btn"
              aria-label={`Remove ${getPassengerLabel(passenger)}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
      </div>

      {!collapsedPassengers[passenger.id] && (
        <div className="passenger-form-content">
          {/* Basic Information Row */}
          <div className="form-row">
            <div className="title-dropdown">
              <select
                value={passenger.title}
                onChange={(e) =>
                  updatePassengerData(passenger.id, "title", e.target.value)
                }
                className="form-select"
              >
                <option value="">Title</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
                <option value="Dr">Dr</option>
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

            <div className="name-input-group">
              <input
                type="text"
                placeholder="First name"
                value={passenger.firstName}
                onChange={(e) =>
                  updatePassengerData(passenger.id, "firstName", e.target.value)
                }
                className="form-input flex-1"
              />
              {passenger.firstName && (
                <button
                  className="clear-input-btn"
                  onClick={() =>
                    updatePassengerData(passenger.id, "firstName", "")
                  }
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.47 2 2 6.97 2 12C2 18.03 6.47 22 12 22C17.53 22 22 18.03 22 12C22 6.97 17.53 2 12 2ZM12 20C7.59 20 4 16.91 4 12C4 8.09 7.59 4 12 4C16.41 4 20 8.09 20 12C20 16.91 16.41 20 12 20ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"
                      fill="black"
                      opacity="0.6"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="name-input-group">
              <input
                type="text"
                placeholder="Last name"
                value={passenger.lastName}
                onChange={(e) =>
                  updatePassengerData(passenger.id, "lastName", e.target.value)
                }
                className="form-input flex-1"
              />
              {passenger.lastName && (
                <button
                  className="clear-input-btn"
                  onClick={() =>
                    updatePassengerData(passenger.id, "lastName", "")
                  }
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.47 2 2 6.97 2 12C2 18.03 6.47 22 12 22C17.53 22 22 18.03 22 12C22 6.97 17.53 2 12 2ZM12 20C7.59 20 4 16.91 4 12C4 8.09 7.59 4 12 4C16.41 4 20 8.09 20 12C20 16.91 16.41 20 12 20ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"
                      fill="black"
                      opacity="0.6"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="date-of-birth-container">
            <input
              type="date"
              value={passenger.dateOfBirth}
              onChange={(e) =>
                updatePassengerData(passenger.id, "dateOfBirth", e.target.value)
              }
              className="form-input date-input"
              placeholder="Date of birth"
            />
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="calendar-icon"
            >
              <path
                d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 5.4 3.01 6L3 20C3 21.0304 3.21071 21.5391 3.58579 21.9142C3.96086 22.2893 4.46957 22.5 5 22H19C20.1 22 21 21.6 21 20V6C21 5.4 20.1 4 19 4ZM19 20H5V10H19V20ZM9 14H7V12H9V14ZM13 14H11V12H13V14ZM17 14H15V12H17V14ZM9 18H7V16H9V18ZM13 18H11V16H13V18ZM17 18H15V16H17V18Z"
                fill="black"
                opacity="0.4"
              />
            </svg>
          </div>

          {/* Passport Details - Expandable */}
          <div className="expandable-section">
            <button
              onClick={() => toggleSection(`passport-${passenger.id}`)}
              className="expandable-toggle"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={`toggle-icon ${
                  expandedSections[`passport-${passenger.id}`] ? "expanded" : ""
                }`}
              >
                <path
                  d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                  fill="black"
                  opacity="0.8"
                />
              </svg>
              <span>Add passport details</span>
            </button>

            {expandedSections[`passport-${passenger.id}`] && (
              <div className="expanded-content">
                <input
                  type="text"
                  placeholder="Add passport number"
                  value={passenger.passportNumber || ""}
                  onChange={(e) =>
                    updatePassengerData(
                      passenger.id,
                      "passportNumber",
                      e.target.value
                    )
                  }
                  className="form-input passport-input"
                />
              </div>
            )}
          </div>

          {/* Flyer Membership - Expandable */}
          <div className="expandable-section">
            <button
              onClick={() => toggleSection(`flyer-${passenger.id}`)}
              className="expandable-toggle"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={`toggle-icon ${
                  expandedSections[`flyer-${passenger.id}`] ? "expanded" : ""
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

            {expandedSections[`flyer-${passenger.id}`] && (
              <div className="expanded-content">
                <input
                  type="text"
                  placeholder="Flyer membership number"
                  value={passenger.flyerMembership || ""}
                  onChange={(e) =>
                    updatePassengerData(
                      passenger.id,
                      "flyerMembership",
                      e.target.value
                    )
                  }
                  className="form-input flyer-input"
                />
              </div>
            )}
          </div>

          {/* Special Assistance */}
          <div className="expandable-section">
            <button
              onClick={() =>
                updatePassengerData(
                  passenger.id,
                  "needsAssistance",
                  !passenger.needsAssistance
                )
              }
              className="expandable-toggle"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                  fill="black"
                  opacity="0.8"
                />
              </svg>
              <span>I need special assistance</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (!isExpanded) {
    return (
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
  }

  return (
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

        {/* Passenger Management */}
        <div className="passenger-management">
          <div className="add-passenger-controls">
            <button
              onClick={() => addPassenger("adult")}
              className="add-passenger-btn adult"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Add Adult ({passengerCount.adults})</span>
            </button>

            <button
              onClick={() => addPassenger("child")}
              className="add-passenger-btn child"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Add Child ({passengerCount.children})</span>
            </button>

            <button
              onClick={() => addPassenger("infant")}
              className="add-passenger-btn infant"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Add Infant ({passengerCount.infants})</span>
            </button>
          </div>
        </div>

        {/* Passenger Forms */}
        <div className="passengers-section">
          {passengers.map((passenger) => (
            <PassengerForm key={passenger.id} passenger={passenger} />
          ))}
        </div>

        {/* Contact Information */}
        <div className="contact-section">
          <h3 className="section-title">Contact information</h3>
          <div className="contact-form">
            <div className="contact-row">
              <div className="country-code-dropdown">
                <select
                  value={contactInfo.countryCode}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      countryCode: e.target.value,
                    }))
                  }
                  className="form-select"
                >
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

              <input
                type="tel"
                placeholder="Contact number"
                value={contactInfo.phoneNumber}
                onChange={(e) =>
                  setContactInfo((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="form-input contact-input"
              />

              <input
                type="email"
                placeholder="Email address"
                value={contactInfo.email}
                onChange={(e) =>
                  setContactInfo((prev) => ({ ...prev, email: e.target.value }))
                }
                className="form-input flex-1"
              />
            </div>

            {/* Newsletter Subscription */}
            <div className="newsletter-subscription">
              <button
                onClick={() =>
                  setContactInfo((prev) => ({
                    ...prev,
                    receiveOffers: !prev.receiveOffers,
                  }))
                }
                className={`subscription-checkbox ${
                  contactInfo.receiveOffers ? "checked" : ""
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z"
                    fill="#014569"
                  />
                </svg>
              </button>
              <span className="subscription-text">
                I would like to receive exclusive offers and news from
                Travulu. I am aware that I can unsubscribe at any time.
              </span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button className="continue-button">
          <span>Continue</span>
        </button>
      </div>
    </div>
  );
}
