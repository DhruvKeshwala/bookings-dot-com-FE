import HotelDetail from "@/views/no-auth/hotels/detail";

interface HotelDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ✅ Mark the function as async
const HotelDetailPage = async ({ params }: HotelDetailPageProps) => {
  const { id } = await params; // Await the params object
  return <HotelDetail hotelId={id} />;
};

export default HotelDetailPage;
