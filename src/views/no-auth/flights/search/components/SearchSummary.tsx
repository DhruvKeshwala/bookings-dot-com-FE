import SearchBox from "@/components/SearchBox";
interface SearchSummaryData {
  route: {
    from: { city: string; code: string };
    to: { city: string; code: string };
  };
  dates: string;
  travelers: string;
  class: string;
}
interface SearchSummaryProps {
  data: SearchSummaryData;
  newData: any;
}

export default function SearchSummary({
  newData,
}: Readonly<SearchSummaryProps>) {
  return <SearchBox initialValue={newData} />;
}
