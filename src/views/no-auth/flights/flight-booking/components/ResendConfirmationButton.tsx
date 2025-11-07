import Button from "@/components/ui/NewButton";
import { Mail } from "lucide-react";
import { useState } from "react";
import http from "@/services/http";

interface Props {
  bookingId: number;
}

const ResendConfirmationButton = ({ bookingId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await http.get(`/flight/resend-confirmation/mail?bookingid=${bookingId}`);
      if (res?.data?.message === "email sent successfully") {
        setSuccess("Email sent again successfully");
        alert("Email sent again successfully");
      } else {
        setSuccess("Confirmation email sent!");
      }
    } catch {
      setError("Failed to send confirmation email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        className="w-full text-orange-500 border-2 border-orange-500 bg-white"
        onClick={handleResend}
        disabled={loading}
      >
        <span className="flex items-center gap-2">
          <Mail size={20} />
          {loading ? "Sending..." : "Resend Confirmation Email"}
        </span>
      </Button>
      {success && <div className="text-green-600 text-xs mt-1">{success}</div>}
      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default ResendConfirmationButton;
