type PropsType = {
  index?: number;
  label: string;
  count: number;
  setCount: (count: number) => void;
  min?: number;
  max?: number;
};
export default function TravellerCounter({
  index,
  count,
  setCount,
  label,
  max = 10,
  min = 0,
}: Readonly<PropsType>) {
  return (
    <div key={index} className="flex justify-between items-center gap-5">
      <p className="subheading">{label}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCount(Math.max(count - 1, min))}
          className="w-6 h-6 flex items-center justify-center rounded-sm bg-primary text-white text-xl cursor-pointer"
        >
          -
        </button>
        <div className="min-w-[28px] h-6 px-0 py-1 flex items-center text-primary justify-center rounded bg-white border border-primary ">
          {count}
        </div>
        <button
          onClick={() => setCount(Math.min(count + 1, max))}
          className="w-6 h-6 flex items-center justify-center rounded-sm bg-primary text-white text-xl cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
