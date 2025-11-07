import React, { useState, useEffect } from "react";

import Button from "@/components/ui/NewButton";
import { getStorageItem } from "@/services/storage";
import { LOCAL_KEY } from "@/common/enums";
import http from "@/services/http";

interface CancelFlightButtonProps {
  bookingId: string | number;
  onSuccess?: () => void;
}

const CancelFlightButton: React.FC<CancelFlightButtonProps> = ({
  bookingId,
  onSuccess,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showModal]);

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);
      if (!token) throw new Error("No access token");
      const body = {
        RequestType: 1,
        CancellationType: 3,
        BookingId: String(bookingId),
        Remarks: "Test remarks",
      };
      const res = await http.post("/change-request", body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("/change-request response:", res);
      setShowModal(false);
      alert("Flight cancellation request submitted successfully.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel flight"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="bg-white text-[#001F50] border border-[#001F50] px-4 py-2 rounded-lg cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        Cancel Flight
      </button>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-[1px]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-4 text-center">
              Are you sure you want to cancel this flight?
            </h4>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <div className="flex gap-4 mt-2">
              <Button
                className="px-6 py-2 rounded text-white font-semibold cursor-pointer bg-[#001F50]"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Yes"}
              </Button>
              <Button
                className="px-6 py-2 rounded border border-gray-300 bg-white text-gray-700 cursor-pointer font-semibold"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CancelFlightButton;
