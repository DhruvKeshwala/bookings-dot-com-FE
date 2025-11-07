"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/NewButton";
import http from "@/services/http";
import { setStorageItem } from "@/services/storage";
import { LOCAL_KEY } from "@/common/enums";
import { useSetAtom } from "jotai";
import { userAtom } from "@/app/atoms/auth";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-input-2";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn?: () => void;
}

const initialValue = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

// Function to detect country from phone number
const detectCountryFromPhone = (phone: string): string => {
  if (!phone) return "in"; // Default to India

  // Remove any spaces or special characters
  const cleanPhone = phone.replace(/\s+/g, "");

  // Common country codes
  if (cleanPhone.startsWith("+91")) return "in"; // India
  if (cleanPhone.startsWith("+1")) return "us"; // USA/Canada
  if (cleanPhone.startsWith("+44")) return "gb"; // UK
  if (cleanPhone.startsWith("+61")) return "au"; // Australia
  if (cleanPhone.startsWith("+86")) return "cn"; // China
  if (cleanPhone.startsWith("+81")) return "jp"; // Japan
  if (cleanPhone.startsWith("+49")) return "de"; // Germany
  if (cleanPhone.startsWith("+33")) return "fr"; // France
  if (cleanPhone.startsWith("+39")) return "it"; // Italy
  if (cleanPhone.startsWith("+34")) return "es"; // Spain
  if (cleanPhone.startsWith("+31")) return "nl"; // Netherlands
  if (cleanPhone.startsWith("+46")) return "se"; // Sweden
  if (cleanPhone.startsWith("+47")) return "no"; // Norway
  if (cleanPhone.startsWith("+45")) return "dk"; // Denmark
  if (cleanPhone.startsWith("+358")) return "fi"; // Finland
  if (cleanPhone.startsWith("+7")) return "ru"; // Russia
  if (cleanPhone.startsWith("+55")) return "br"; // Brazil
  if (cleanPhone.startsWith("+52")) return "mx"; // Mexico
  if (cleanPhone.startsWith("+54")) return "ar"; // Argentina
  if (cleanPhone.startsWith("+27")) return "za"; // South Africa
  if (cleanPhone.startsWith("+971")) return "ae"; // UAE
  if (cleanPhone.startsWith("+966")) return "sa"; // Saudi Arabia
  if (cleanPhone.startsWith("+852")) return "hk"; // Hong Kong
  if (cleanPhone.startsWith("+65")) return "sg"; // Singapore
  if (cleanPhone.startsWith("+60")) return "my"; // Malaysia
  if (cleanPhone.startsWith("+66")) return "th"; // Thailand
  if (cleanPhone.startsWith("+84")) return "vn"; // Vietnam
  if (cleanPhone.startsWith("+62")) return "id"; // Indonesia
  if (cleanPhone.startsWith("+63")) return "ph"; // Philippines

  return "in"; // Default to India
};

export default function SignUpModal({
  isOpen,
  onClose,
  onSwitchToSignIn,
}: Readonly<SignUpModalProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const API_BASE = process.env.NEXT_PUBLIC_BASE_URI;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Sync phone local state with form data
  useEffect(() => {
    setPhoneLocal(formData.phone);
  }, [formData.phone]);

  const setUser = useSetAtom(userAtom);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    setPhoneLocal(value);
    handleInputChange("phone", value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Phone validation: For India, must be 10 digits (without country code)
    const phone = formData.phone;
    let phoneDigits = phone.replace(/[^0-9]/g, "");
    if (detectCountryFromPhone(phone) === "in") {
      // Always use last 10 digits for India
      phoneDigits = phoneDigits.slice(-10);
      if (phoneDigits.length !== 10) {
        alert("Phone must be 10 digits for India");
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!formData.agreeToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    // Handle form submission logic here

    try {
      setIsLoading(true);
      const { agreeToTerms, ...rest } = formData;
      // For India, send only last 10 digits; otherwise, send as is
      rest.phone = detectCountryFromPhone(phone) === "in" ? phoneDigits : phone;
      const { data } = await http.post("/users/register", rest);

      if (data) {
        const userData = {
          email: data.email,
          id: data.id,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
        };

        // setStorageItem(LOCAL_KEY.ACCESS_TOKEN, data.token);
        // setStorageItem(LOCAL_KEY.USER, JSON.stringify(userData));

        // setUser(userData);
        // setFormData(initialValue);
        setOtpSent(true);
        // onClose();
      }
    } catch (err) {
      console.error("FareQuote Error:", err);
    } finally {
      setIsLoading(true);
    }
    // onClose();
  };

  const handleSubmitWithOtp = async (enteredOtp: any) => {
    const email = formData.email;
    const otp = enteredOtp;
    try {
      setIsLoading(true);
      const { data } = await http.post("/users/verifyotp", { email, otp });

      if (data?.user) {
        const userData = {
          email: data?.user?.email,
          id: data?.user?.id,
          phone: data?.user?.phone,
          firstName: data?.user?.firstName,
          lastName: data?.user?.lastName,
        };

        setStorageItem(LOCAL_KEY.ACCESS_TOKEN, data?.user?.token);
        setStorageItem(LOCAL_KEY.USER, JSON.stringify(userData));

        setUser(userData);
        onClose();
      }
    } catch (err) {
      console.error("verify error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const currentUrl = window.location.href;
    localStorage.setItem("returnTo", currentUrl);
    window.location.href = `${API_BASE}/auth/google`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0  bg-opacity-40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 "
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          className="relative w-full max-w-6xl max-h-[614px] bg-white rounded-lg overflow-hidden shadow-2xl mx-auto "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Side - Image (hidden on mobile) */}
            <div className="hidden lg:flex flex-[1.5] relative bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
              <Image
                src="/assets/banners/auth-banner.svg"
                alt="Travel Adventure"
                fill
                className="object-cover"
              />
            </div>

            {/* Right Side - Form */}
            <div className="flex-[0.9] w-full py-7 px-[52px] overflow-y-auto max-h-[600px] bg-[#F7F8FA]">
              {/* Brand Name */}
              <div className="text-center mb-2">
                <h1 className="text-4xl font-bold text-[#FF6B6B] font-poppins">
                  Travulu
                </h1>
              </div>

              {/* Form Header */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray mb-2 font-raleway">
                  Create your account
                </h2>
                <p className="text-[#374151]  text-sm font-nunito">
                  Sign up to start planning your next adventure and receive
                  exclusive travel offers.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 font-nunito">
                <div className="grid grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-black font-bold text-base mb-2 capitalize font-nunito">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="First name"
                      className="w-full h-[50px] px-3 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] font-nunito"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-black font-bold text-base mb-2 capitalize font-nunito">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder="Last name"
                      className="w-full h-[50px] px-3 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] font-nunito"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-black font-bold text-base mb-2 capitalize font-nunito">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@example.com"
                    className="w-full h-[50px] px-3 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] font-nunito"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-black font-bold text-base mb-2 capitalize font-nunito">
                    Phone
                  </label>
                  <PhoneInput
                    country={detectCountryFromPhone(phoneLocal)}
                    value={phoneLocal}
                    onChange={handlePhoneChange}
                    inputClass="!w-full !h-[50px] !px-3 !text-black !text-lg !font-nunito !pl-[60px] focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569]"
                    buttonClass="!bg-white !border !border-[#b3b3b3] !rounded-l-lg"
                    containerClass="!w-full"
                    dropdownClass="!text-black"
                    enableSearch
                    countryCodeEditable={false}
                    inputStyle={{
                      width: "100%",
                      height: "50px",
                      paddingLeft: "60px",
                      border: "1px solid #b3b3b3",
                      borderRadius: "8px",
                      fontSize: "18px",
                      fontFamily: "Nunito, sans-serif",
                    }}
                    buttonStyle={{
                      border: "1px solid #b3b3b3",
                      borderRight: "none",
                      borderRadius: "8px 0 0 8px",
                      backgroundColor: "white",
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-black font-bold text-base mb-2 capitalize font-nunito">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Create a strong password"
                      className="w-full h-[50px] px-3 pr-12 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] font-nunito"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  <p className="text-black text-xs mt-2 font-nunito">
                    Password must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-black font-bold text-base mb-2 capitalize font-nunito">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirm your password"
                      className="w-full h-[50px] px-3 pr-12 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] font-nunito"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <Eye size={20} />
                      ) : (
                        <EyeOff size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={(e) =>
                        handleInputChange("agreeToTerms", e.target.checked)
                      }
                      className="sr-only"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="flex items-center justify-center w-6 h-6 border-2 border-primary rounded-full cursor-pointer"
                    >
                      {formData.agreeToTerms && (
                        <div className="w-3 h-3 bg-[#016aa2] rounded-full"></div>
                      )}
                    </label>
                  </div>
                  <div className=" leading-6 font-nunito text-[14px]">
                    <span className="text-black">I agree to the </span>
                    <a
                      href="/urls/PrivacyPolicy.html"
                      className="text-coral underline hover:no-underline"
                      target="_blank" rel="noopener noreferrer"
                    >
                      Terms of Service
                    </a>
                    <span className="text-black"> and </span>
                    <a
                      href="/urls/PrivacyPolicy.html"
                      className="text-coral underline hover:no-underline"
                      target="_blank" rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="solid"
                  color="secondary"
                  className="w-full"
                >
                  Create Account
                </Button>
              </form>

              {otpSent && (
                <>
                  <div className="mt-6 ">
                    <label className="block text-black font-bold text-base mb-2 capitalize font-nunito">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full h-[50px] px-3 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] font-nunito"
                    />
                  </div>

                  <Button
                    onClick={() => handleSubmitWithOtp(otp)}
                    variant="solid"
                    color="secondary"
                    className="w-full mt-3"
                  >
                    Verify & Submit
                  </Button>
                </>
              )}

              {/* Toggle to Sign In */}
              <div className="text-center mt-6">
                <span className="text-black font-nunito">
                  Already have an account?
                </span>
                <button
                  onClick={onSwitchToSignIn}
                  className="text-[#f25c54] cursor-pointer font-bold hover:underline ml-1 font-nunito"
                >
                  Sign in
                </button>
              </div>

              {/* Social Login */}
              <div className="flex gap-5 mt-5 mb-4">
                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  className="mx-auto flex flex-row items-center justify-center gap-2 h-10 px-8 border border-[#b3b3b3] rounded-lg bg-white text-black text-lg focus:outline-none focus:ring-2 focus:ring-[#014569] focus:border-[#014569] cursor-pointer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 25 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_280_8009)">
                      <path
                        d="M8.85909 0.789371C6.46112 1.62125 4.39311 3.20018 2.95882 5.29425C1.52454 7.38832 0.799573 9.88714 0.890418 12.4237C0.981264 14.9602 1.88313 17.4008 3.46355 19.3869C5.04396 21.373 7.21962 22.7999 9.67096 23.4581C11.6583 23.9709 13.7405 23.9934 15.7385 23.5237C17.5484 23.1172 19.2218 22.2476 20.5947 21C22.0236 19.6619 23.0608 17.9596 23.5947 16.0762C24.1751 14.0281 24.2783 11.8742 23.8966 9.78H12.7366V14.4094H19.1997C19.0705 15.1477 18.7937 15.8524 18.3859 16.4813C17.978 17.1102 17.4474 17.6503 16.826 18.0694C16.0367 18.5914 15.1471 18.9427 14.2141 19.1006C13.2784 19.2746 12.3186 19.2746 11.3828 19.1006C10.4344 18.9045 9.53727 18.5131 8.74846 17.9512C7.48124 17.0542 6.52973 15.7799 6.02971 14.31C5.52124 12.8126 5.52124 11.1893 6.02971 9.69187C6.38564 8.64228 6.97403 7.68663 7.75096 6.89625C8.64007 5.97515 9.76571 5.31674 11.0044 4.99326C12.243 4.66979 13.5469 4.69374 14.7728 5.0625C15.7305 5.35648 16.6063 5.87013 17.3303 6.5625C18.0591 5.8375 18.7866 5.11062 19.5128 4.38187C19.8878 3.99 20.2966 3.61687 20.666 3.21562C19.5608 2.18714 18.2635 1.38685 16.8485 0.860622C14.2717 -0.0750226 11.4522 -0.100167 8.85909 0.789371Z"
                        fill="white"
                      />
                      <path
                        d="M8.85875 0.789367C11.4516 -0.100776 14.2711 -0.0762934 16.8481 0.858742C18.2634 1.38855 19.5601 2.19269 20.6637 3.22499C20.2887 3.62624 19.8931 4.00124 19.5106 4.39124C18.7831 5.11749 18.0562 5.84124 17.33 6.56249C16.606 5.87012 15.7302 5.35648 14.7725 5.06249C13.547 4.69244 12.2432 4.66711 11.0042 4.98926C9.76516 5.31141 8.63883 5.96861 7.74875 6.88874C6.97181 7.67912 6.38342 8.63477 6.0275 9.68437L2.14062 6.67499C3.53189 3.91604 5.94078 1.80566 8.85875 0.789367Z"
                        fill="#E33629"
                      />
                      <path
                        d="M1.1114 9.65624C1.32032 8.62085 1.66716 7.61816 2.14265 6.67499L6.02953 9.69186C5.52105 11.1892 5.52105 12.8126 6.02953 14.31C4.73453 15.31 3.4389 16.315 2.14265 17.325C0.952308 14.9556 0.589275 12.2559 1.1114 9.65624Z"
                        fill="#F8BD00"
                      />
                      <path
                        d="M12.7391 9.77814H23.8991C24.2809 11.8724 24.1776 14.0263 23.5972 16.0744C23.0633 17.9578 22.0261 19.66 20.5972 20.9981C19.3429 20.0194 18.0829 19.0481 16.8285 18.0694C17.4504 17.6499 17.9812 17.1092 18.3891 16.4796C18.797 15.8501 19.0735 15.1447 19.2022 14.4056H12.7391C12.7372 12.8644 12.7391 11.3213 12.7391 9.77814Z"
                        fill="#587DBD"
                      />
                      <path
                        d="M2.14062 17.325C3.43687 16.325 4.7325 15.32 6.0275 14.31C6.52851 15.7804 7.48138 17.0548 8.75 17.9512C9.54127 18.5105 10.4404 18.8987 11.39 19.0912C12.3257 19.2652 13.2855 19.2652 14.2213 19.0912C15.1542 18.9333 16.0439 18.5821 16.8331 18.06C18.0875 19.0387 19.3475 20.01 20.6019 20.9887C19.2292 22.237 17.5558 23.1073 15.7456 23.5144C13.7476 23.9841 11.6655 23.9616 9.67813 23.4487C8.10632 23.0291 6.63814 22.2892 5.36563 21.2756C4.01874 20.2063 2.91867 18.8587 2.14062 17.325Z"
                        fill="#319F43"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_280_8009">
                        <rect
                          width="24"
                          height="24"
                          fill="white"
                          transform="translate(0.5)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-[#014569] font-nunito">
                    Continue With Google
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
