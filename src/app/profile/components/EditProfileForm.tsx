"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { uploadAvatar } from "./uploadAvatar";
import Button from "@/components/ui/NewButton";
import PhoneInput from "react-phone-input-2";
import { CameraIcon } from "lucide-react";

interface EditProfileFormProps {
  user: any;
  editForm: any;
  onFormChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

/* ---------- Helpers ---------- */

// E.164 + best-effort cleanup
const toE164 = (raw: string): string => {
  if (!raw) return "";
  // keep + and digits only
  let v = raw.replace(/[^\d+]/g, "");
  // if starts without + and looks like 10-digit Indian mobile (6-9 start), add +91
  const justDigits = v.replace(/\D/g, "");
  if (!v.startsWith("+") && /^[6-9]\d{9}$/.test(justDigits)) {
    v = `+91${justDigits}`;
  }
  // if doesn't start with + but has digits, prefix +
  if (!v.startsWith("+") && justDigits) {
    v = `+${justDigits}`;
  }
  return v;
};

// Map from prefix to ISO (keep India strict, rest basic)
const detectCountryFromPhone = (phoneE164: string): string => {
  const p = (phoneE164 || "").replace(/\s/g, "");
  if (p.startsWith("+91")) return "in"; // India (force)
  if (p.startsWith("+1")) return "us";
  if (p.startsWith("+44")) return "gb";
  if (p.startsWith("+61")) return "au";
  if (p.startsWith("+86")) return "cn";
  if (p.startsWith("+81")) return "jp";
  if (p.startsWith("+49")) return "de";
  if (p.startsWith("+33")) return "fr";
  if (p.startsWith("+39")) return "it";
  if (p.startsWith("+34")) return "es";
  if (p.startsWith("+31")) return "nl";
  if (p.startsWith("+46")) return "se";
  if (p.startsWith("+47")) return "no";
  if (p.startsWith("+45")) return "dk";
  if (p.startsWith("+358")) return "fi";
  if (p.startsWith("+7")) return "ru";
  if (p.startsWith("+55")) return "br";
  if (p.startsWith("+52")) return "mx";
  if (p.startsWith("+54")) return "ar";
  if (p.startsWith("+27")) return "za";
  if (p.startsWith("+971")) return "ae";
  if (p.startsWith("+966")) return "sa";
  if (p.startsWith("+852")) return "hk";
  if (p.startsWith("+65")) return "sg";
  if (p.startsWith("+60")) return "my";
  if (p.startsWith("+66")) return "th";
  if (p.startsWith("+84")) return "vn";
  if (p.startsWith("+62")) return "id";
  if (p.startsWith("+63")) return "ph";
  return "in"; // sensible default
};

export default function EditProfileForm({
  user,
  editForm,
  onFormChange,
  onSubmit,
  saving,
}: EditProfileFormProps) {
  /* ---------- Phone state (always E.164) ---------- */
  const [phoneLocal, setPhoneLocal] = useState<string>(toE164(editForm?.phone || ""));

  useEffect(() => {
    setPhoneLocal(toE164(editForm?.phone || ""));
  }, [editForm?.phone]);

  // Country derived from normalized value
  const countryIso = useMemo(() => detectCountryFromPhone(phoneLocal), [phoneLocal]);

  // react-phone-input-2 gives: (value, country, event, formattedValue)
  const handlePhoneChange = (
    value: string,
    _country: any,
    _e: any,
    formattedValue?: string
  ) => {
    // Prefer formattedValue because it contains `+` and spacing; convert to E.164
    const e164 = toE164(formattedValue || value);
    setPhoneLocal(e164);
    onFormChange("phone", e164);
  };

  /* ---------- Avatar upload ---------- */
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        setAvatarLoading(false);
        return;
      }
      const data = await uploadAvatar(file);
      let url = data.avatarUrl || data.url || data.path;
      if (url) {
        // Always store as absolute URL
        if (!/^https?:\/\//.test(url)) {
          // Try to get backend base URL from env or fallback
          let baseURL = process.env.NEXT_PUBLIC_BASE_URI || process.env.NEXT_BASE_URI || "https://api.travulu.com";
          // If running locally, use the backend API URL, not localhost:3000
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            // Set to your backend API URL for local dev
            baseURL = "http://localhost:8000";
          }
          url = baseURL.replace(/\/$/, "") + (url.startsWith("/") ? url : "/" + url);
        }
        onFormChange("avatarUrl", url);
      } else {
        alert("Upload failed: No image URL returned.");
      }
    } catch {
      alert("Failed to upload image. Please try again.");
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between mb-4 font-nunito">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Edit profile</h2>
          <p className="text-gray-500">
            Update your personal details, preferences, and travel settings all in one place.
          </p>
        </div>

        {/* Avatar */}
        <div className="relative w-20 h-20">
          <div
            className="w-20 h-20 rounded-full border border-[#d1d5db] overflow-hidden flex items-center justify-center bg-gray-100 cursor-pointer relative group"
            onClick={handleAvatarClick}
          >
            {editForm.avatarUrl ? (
              <Image
                src={editForm.avatarUrl}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full object-cover w-20 h-20"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-700">
                {user.firstName?.[0] || ""}
                {user.lastName?.[0] || ""}
              </span>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <CameraIcon className="w-5 h-5 text-white" />
            </div>

            {avatarLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center rounded-full">
                <span className="loader border-t-2 border-b-2 border-gray-500 w-6 h-6 rounded-full animate-spin"></span>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
            disabled={avatarLoading}
          />
        </div>
      </div>

      <form className="grid grid-cols-2 gap-6" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2"
            value={editForm.firstName}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2"
            value={editForm.lastName}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2"
            value={editForm.email}
            disabled
          />
        </div>

        {/* Contact Number (fixed) */}
        <div>
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <PhoneInput
            /* IMPORTANT: country is only read on mount -> use key to remount when it changes */
            key={countryIso}
            country={countryIso}
            disableCountryGuess
            preferredCountries={["in"]}
            countryCodeEditable={false}
            value={phoneLocal}
            onChange={handlePhoneChange}
            inputClass="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2 text-black"
            buttonClass="bg-white border border-[#d1d5db] border-r-0 px-2"
            containerClass="w-full"
            dropdownClass="text-black"
            enableSearch
            // keep inline styles minimal so Tailwind drives the look
            inputStyle={{
              width: "100%",
              height: "40px",
              fontSize: "16px",
            }}
            buttonStyle={{
              backgroundColor: "white",
              border: "1px solid #d1d5db",
              borderRight: "none",
            }}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2"
            value={editForm.address}
            onChange={(e) => onFormChange("address", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2"
            value={editForm.city}
            onChange={(e) => onFormChange("city", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <input
            type="text"
            className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2"
            value={editForm.state}
            onChange={(e) => onFormChange("state", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            type="text"
            className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2"
            value={editForm.country}
            onChange={(e) => onFormChange("country", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pin Code</label>
          <input
            type="text"
            className="w-full bg-white border border-[#d1d5db] shadow-sm rounded px-3 py-2"
            value={editForm.pincode}
            onChange={(e) => onFormChange("pincode", e.target.value)}
          />
        </div>

        <div className="col-span-2 flex flex-col sm:flex-row gap-4 mt-6">
          <Button
            type="button"
            variant="solid"
            color="secondary"
            className="bg-white text-[#FF6B6B] border border-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-colors"
          >
            <Link href="/">Back</Link>
          </Button>

          <Button type="submit" variant="solid" color="secondary" isLoading={saving}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
