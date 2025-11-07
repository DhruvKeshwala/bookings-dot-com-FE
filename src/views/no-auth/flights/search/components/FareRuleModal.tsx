"use client";
import { useEffect, useRef } from "react";

export default function FareRuleModal({
  isOpen,
  onClose,
  content,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop: clicking/tapping here will close the modal
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      // use pointer events so it works on touch and mouse
      onPointerDown={(e) => {
        // If user clicks on the backdrop (this div), close
        // Note: inner modal stops propagation so clicks inside won't bubble here
        onClose();
      }}
    >
      <div
        ref={modalRef}
        // Stop the backdrop handler when clicking inside the modal
        onPointerDown={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[80vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4">Fare Rules</h2>
        {/* API gives HTML, so use dangerouslySetInnerHTML */}
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
