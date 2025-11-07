import Image from "next/image";
import StorySlider from "./StorySlider";

export default function LoadingTransition() {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row justify-center items-center gap-14 bg-white animate-fade-in">
      {/* Left Section - Image */}
      <div className="w-[50%] flex items-center justify-center">
        <div className="relative w-fit rounded-2xl overflow-hidden shadow-md">
          <StorySlider />
          <div className="absolute top-4 left-4 text-white text-sm font-medium">
            <span>📍 Welcome On board</span>
          </div>
          <div className="absolute bottom-4 left-4 text-white text-lg font-bold flex items-center space-x-2">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets%2Fe4f85e9169de426498b1ca8b690bacff%2Fbefa79fdfaae570631f37f18fedb30ac5d120e65"
              alt="logo"
              width={120}
              height={60}
            />
          </div>
        </div>
      </div>

      {/* Right Section - Text */}
      <div className="text-center md:text-left">
        <div className="text-4xl font-bold leading-tight text-gray-900">
          <span className="text-[#7AE582]">Travulu</span>
        </div>
        <h2 className="text-2xl font-bold mt-2">
          It&apos;s The Detail That Make A Journey Perfect
        </h2>
        <div className="mt-4 text-gray-600 font-medium">Loading Result</div>
        <div className="flex justify-center md:justify-start mt-2 gap-2">
          <span className="w-3 h-3 bg-blue-300 rounded-full animate-pulse" />
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-200" />
          <span className="w-3 h-3 bg-blue-300 rounded-full animate-pulse delay-400" />
        </div>
      </div>
    </div>
  );
}
