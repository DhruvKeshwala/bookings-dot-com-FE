"use client";

import React from "react";

type RangeSliderProps = {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number]; // min and max selected
  onChange: (value: [number, number]) => void;
  label?: string;
  className?: string;
};

const RangeSlider: React.FC<RangeSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label,
  className = "",
}) => {
  const [minVal, maxVal] = value;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - step);
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + step);
    onChange([minVal, val]);
  };

  return (
    <div className={`w-full py-2 ${className}`}>
      {label && (
        <label className="block mb-1 text-sm font-medium">{label}</label>
      )}
      <div className="relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="custom-range-slider"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="custom-range-slider"
        />
        <div className="slider-track" />
        <div
          className="slider-range"
          style={{
            left: `${((minVal - min) / (max - min)) * 100}%`,
            right: `${100 - ((maxVal - min) / (max - min)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default RangeSlider;
