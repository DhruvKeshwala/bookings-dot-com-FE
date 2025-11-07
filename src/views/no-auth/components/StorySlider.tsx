"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const stories = [
  {
    image: "/assets/stories/Chittorgarh, Rajasthan.jpg",
    fact: "Chittorgarh, Rajasthan – The massive Chittorgarh Fort has 36 magnificent gates, each with its own story, making it feel like a real-life labyrinth from a historical adventure movie.",
  },
  {
    image: "/assets/stories/Udaipur, Rajasthan.jpg",
    fact: "Udaipur, Rajasthan – The City of Lakes has a palace (Lake Palace) that is literally floating on water, making it look like a magical hotel straight out of a fairy tale.",
  },
  {
    image: "/assets/stories/Jaipur, Rajasthan.jpg",
    fact: "Jaipur, Rajasthan – The Hawa Mahal is designed so one can feel a cool breeze through the 953 tiny windows, even on the hottest summer days!",
  },
  {
    image: "/assets/stories/Jaisalmer, Rajasthan.jpg",
    fact: "Jaisalmer, Rajasthan – The Golden Fort glows like gold at sunset because it’s made of yellow sandstone, earning it the nickname “The Golden City.”",
  },
  {
    image: "/assets/stories/Shillong, Meghalaya.jpg",
    fact: "Shillong, Meghalaya – The city is so green and rainy that locals call it the “Scotland of the East”, and it has a cathedral made entirely of wood without using a single nail!",
  },
  {
    image: "/assets/stories/Varanasi, Uttar Pradesh.jpg",
    fact: "Varanasi, Uttar Pradesh – You can witness boats moving silently along the Ganges at sunrise, giving the impression that the river is floating on mist. It’s almost unreal.",
  },
  {
    image: "/assets/stories/Manali, Himachal Pradesh.jpg",
    fact: "Manali, Himachal Pradesh – Rohtang Pass has a phenomenon where you can see snow even in summer, and sometimes clouds seem so low you can almost touch them.",
  },
  {
    image: "/assets/stories/Mysore, Karnataka.jpg",
    fact: "Mysore, Karnataka – The Mysore Palace is lit up with 100,000 bulbs every Sunday and during festivals, creating a spectacle that looks like a dreamland.",
  },
  {
    image: "/assets/stories/Darjeeling, West Bengal.jpg",
    fact: "Darjeeling, West Bengal – The famous toy train here moves so slowly through the mountains that you can see entire tea plantations passing by window by window.",
  },
  {
    image: "/assets/stories/Kochi, Kerala.jpg",
    fact: "Kochi, Kerala – You can find Chinese fishing nets that are over 400 years old, still in use today, and they’re so huge they look like gigantic spider webs over the water!",
  },
  {
    image: "/assets/stories/Paris, France.jpg",
    fact: "Paris, France – The Eiffel Tower can grow up to 6 inches taller in the summer because metal expands in the heat.",
  },
  {
    image: "/assets/stories/Venice, Italy.jpg",
    fact: "Venice, Italy – The city is slowly sinking at a rate of about 1–2 mm per year, yet gondolas still float perfectly through its canals.",
  },
  {
    image: "/assets/stories/Tokyo, Japan.jpg",
    fact: "Tokyo, Japan – There is a café where you can drink coffee while surrounded by hundreds of adorable owls. Some people visit just for the photos.",
  },
  {
    image: "/assets/stories/Dubai, UAE.jpg",
    fact: "Dubai, UAE – The Burj Khalifa has the world’s highest observation deck at 555 meters and even has its own zip code.",
  },
  {
    image: "/assets/stories/Iceland.jpg",
    fact: "Iceland – You can bathe in natural hot springs while watching the Northern Lights dance overhead, creating a magical experience.",
  },
  {
    image: "/assets/stories/New Zealand.jpg",
    fact: "New Zealand – Hobbiton, the set from Lord of the Rings, is a permanent tourist attraction with miniature doors and live sheep roaming around.",
  },
  {
    image: "/assets/stories/Machu Picchu, Peru.jpg",
    fact: "Machu Picchu, Peru – Some terraces of the ancient city were built with such precise stone cutting that not even a knife blade can fit between them, without using cement.",
  },
  {
    image: "/assets/stories/Thailand.jpg",
    fact: "Thailand – At the Chiang Mai Flower Festival, locals build boats made entirely of flowers and float them down the river, creating a floating floral paradise.",
  },
  {
    image: "/assets/stories/Australia.jpg",
    fact: "Australia – Lake Hillier is pink and the bubblegum-pink color is natural, caused by a type of algae thriving in the salty water.",
  },
];

const DURATION = 3000;

// 🔹 Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function StorySlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledStories, setShuffledStories] = useState<typeof stories>([]);

  // Shuffle on mount
  useEffect(() => {
    setShuffledStories(shuffleArray(stories));
  }, []);

  // Auto slide
  useEffect(() => {
    if (shuffledStories.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledStories.length);
    }, DURATION);
    return () => clearInterval(timer);
  }, [shuffledStories]);

  if (shuffledStories.length === 0) return null;

  const currentStory = shuffledStories[currentIndex];

  return (
    <div className="flex flex-col lg:mx-auto items-center justify-center bg-white">
      <div className="relative w-[300px] h-[250px] lg:w-[600px] lg:h-[350px] rounded-xl overflow-hidden shadow-xl">
        {/* Image */}
        <Image
          src={currentStory.image}
          alt="Story Image"
          fill
          className="object-cover transition-opacity duration-1000"
          priority
        />

        {/* Overlay Fact */}
        <div className="absolute inset-0 bg-black/40 flex items-end justify-center text-center p-4">
          <p className="text-white text-sm lg:text-base font-medium leading-snug animate-fadeIn">
            {currentStory.fact}
          </p>
        </div>

        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 flex gap-1">
          {shuffledStories.map((_, index) => (
            <div
              key={`${index}-story`}
              className="h-1 flex-1 bg-white/50 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white"
                style={{
                  width:
                    index < currentIndex
                      ? "100%"
                      : index === currentIndex
                      ? "100%"
                      : "0%",
                  transition:
                    index === currentIndex
                      ? `width ${DURATION}ms linear`
                      : "none",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
