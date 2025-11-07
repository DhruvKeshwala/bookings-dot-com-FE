export default function PromoCodeSection() {
  const promoCodes = [
    {
      code: "SAVE10",
      description: "Save INR 2k on this order",
      details: "Maximum discount up to INR 4k on order above 20k",
      discount: "10% Off",
    },
    {
      code: "SAVE10",
      description: "Save INR 2k on this order",
      details: "Maximum discount up to INR 4k on order above 20k",
      discount: "10% Off",
    },
    {
      code: "SAVE10",
      description: "Save INR 2k on this order",
      details: "Maximum discount up to INR 4k on order above 20k",
      discount: "10% Off",
    },
  ];

  return (
    <div className="hidden md:block">
      <h2 className="text-3xl font-bold font-[Raleway] text-black mb-10">
        Select a promo code
      </h2>

      <div className="space-y-6 font-[Nunito]">
        {promoCodes.map((promo, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl border border-black/30 overflow-hidden flex ${
              index === 0 ? "shadow-lg border-[rgba(1,59,149,0.32)]" : ""
            }`}
          >
            <div className="flex items-center justify-center w-[51px] bg-[#014569] relative">
              <div className="text-white text-lg font-semibold font-nunito whitespace-nowrap transform -rotate-90 py-3 px-6">
                {promo.discount}
              </div>
            </div>

            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-lg font-bold text-black">
                    {promo.code}
                  </div>
                  <div className="text-sm font-medium text-black">
                    {promo.description}
                  </div>
                </div>
                <button className="text-lg font-extrabold bg-gradient-to-b from-[#FF914D] to-[#F25C54] bg-clip-text text-transparent capitalize">
                  Apply
                </button>
              </div>

              <div className="text-xs font-normal text-black">
                {promo.details}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
