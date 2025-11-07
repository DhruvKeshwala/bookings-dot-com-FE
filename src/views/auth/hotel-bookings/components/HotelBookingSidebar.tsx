"use client";

const HotelIconSidebar = () => (
  <svg width="18" height="18" viewBox="0 0 18 19" fill="none">
    <path d="M1.5 14.35C1.2875 14.35 1.1095 14.278 0.966 14.134C0.8225 13.99 0.7505 13.812 0.75 13.6V3.84998C0.75 3.63748 0.822 3.45948 0.966 3.31598C1.11 3.17248 1.288 3.10048 1.5 3.09998C1.712 3.09948 1.89025 3.17148 2.03475 3.31598C2.17925 3.46048 2.251 3.63848 2.25 3.84998V10.6H8.25V6.09998C8.25 5.68748 8.397 5.33448 8.691 5.04098C8.985 4.74748 9.338 4.60048 9.75 4.59998H14.25C15.075 4.59998 15.7813 4.89373 16.3688 5.48123C16.9563 6.06873 17.25 6.77498 17.25 7.59998V13.6C17.25 13.8125 17.178 13.9907 17.034 14.1347C16.89 14.2787 16.712 14.3505 16.5 14.35C16.288 14.3495 16.11 14.2775 15.966 14.134C15.822 13.9905 15.75 13.8125 15.75 13.6V12.1H2.25V13.6C2.25 13.8125 2.178 13.9907 2.034 14.1347C1.89 14.2787 1.712 14.3505 1.5 14.35ZM5.25 9.84998C4.625 9.84998 4.09375 9.63123 3.65625 9.19373C3.21875 8.75623 3 8.22498 3 7.59998C3 6.97498 3.21875 6.44373 3.65625 6.00623C4.09375 5.56873 4.625 5.34998 5.25 5.34998C5.875 5.34998 6.40625 5.56873 6.84375 6.00623C7.28125 6.44373 7.5 6.97498 7.5 7.59998C7.5 8.22498 7.28125 8.75623 6.84375 9.19373C6.40625 9.63123 5.875 9.84998 5.25 9.84998Z" fill="#306BEC"/>
  </svg>
);

interface UpcomingActivity {
  id: string;
  hotelName: string;
  time: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'promo';
}

const upcomingActivities: UpcomingActivity[] = [
  {
    id: "1",
    hotelName: "Novotel New Delhi Aerocity",
    time: "Tomorrow, 10:30 AM"
  },
  {
    id: "2",
    hotelName: "Novotel New Delhi Aerocity",
    time: "Tomorrow, 10:30 AM"
  },
  {
    id: "3",
    hotelName: "Novotel New Delhi Aerocity",
    time: "Tomorrow, 10:30 AM"
  }
];

const notifications: Notification[] = [
  {
    id: "1",
    message: "Your Bus to Novotel Hotel has been confirmed!",
    type: "info"
  },
  {
    id: "2",
    message: "Limited time offer: 20% off on Hotel bookings!",
    type: "promo"
  }
];

const ActivityItem = ({ activity }: { activity: UpcomingActivity }) => (
  <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-all duration-200">
    <div className="flex items-center justify-center p-2 bg-[#DBEAFE] rounded-full shrink-0">
      <HotelIconSidebar />
    </div>
    <div className="flex flex-col justify-center">
      <p className="text-sm font-medium text-black truncate whitespace-break-spaces">
        {activity.hotelName}
      </p>
      <p className="text-xs text-gray-600">{activity.time}</p>
    </div>
  </div>
);

const NotificationItem = ({ notification }: { notification: Notification }) => (
  <div className={`flex items-center justify-center gap-2.5 p-2 rounded hover:shadow-sm transition-all duration-200 cursor-pointer ${
    notification.type === 'info'
      ? 'bg-[#EFF6FF] hover:bg-[#001f502a]'
      : 'bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 hover:from-[#FF914D]/20 hover:to-[#F25C54]/20'
  }`}>
    <p className={`text-xs font-nunito leading-normal ${
      notification.type === 'info'
        ? 'text-[#001F50]'
        : 'bg-gradient-to-r from-[#FF6B6B] to-[#F25C54] bg-clip-text text-transparent font-medium'
    }`}>
      {notification.message}
    </p>
  </div>
);

export default function HotelBookingSidebar() {
  return (
    <div className="flex flex-col gap-6">
      {/* Upcoming Activity Card */}
      <div className="bg-white border border-gray-300 rounded-xl p-4 md:p-5 shadow-sm  gap-4 w-full ">
        <div className="flex flex-col items-start gap-4 ">
            <div className="flex flex-col justify-center h-5">
              <h3 className="text-base font-semibold text-black font-nunito leading-normal">
                Upcoming Activity
              </h3>
            </div>
            {/* Mobile: horizontal scroll, Desktop: stacked */}
            <div className="hidden lg:flex gap-4 no-scrollbar w-full mb-4 lg:flex-col lg:overflow-visible">
              {upcomingActivities.map((activity) => (
                <div className=" lg:min-w-full" key={activity.id}>
                  <ActivityItem activity={activity} />
                </div>
              ))}
            </div>

            <div className="flex w-full gap-4 overflow-x-auto no-scrollbar lg:flex-col lg:overflow-visible lg:hidden">
            <div className="w-full grid grid-cols-2 gap-1 sm:gap-3 mb-5">
              {upcomingActivities.map((item) => (
                <div key={item.id} className="flex items-center gap-1 sm:gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                    <HotelIconSidebar />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-sm font-semibold text-gray-900 leading-tight">
                      {item.hotelName}
                    </span>
                    <span className="text-[7px] sm:text-sm text-gray-500">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Notifications Section */}
        <div className="hidden lg:flex flex-col items-start gap-4 w-full">
          <h3 className="text-base font-semibold text-black font-nunito leading-normal">
            Recent Notifications
          </h3>
          <div className="flex flex-col items-start gap-2 w-full">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>

        {/* Contact Us Button */}
        <button className="w-full flex lg:hidden items-center justify-center gap-2 px-7 py-2 bg-gradient-to-r bg-[#ff6b6b] rounded-lg h-12 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF914D] focus:ring-offset-2">
          <span className="text-base font-normal text-white font-roboto leading-6">
            Contact Us
          </span>
        </button>
      </div>

      {/* Contact Us Button */}
      <button className="hidden lg:flex items-center justify-center gap-2 px-7 py-2 bg-gradient-to-r bg-[#ff6b6b] rounded-lg h-12 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF914D] focus:ring-offset-2">
        <span className="text-base font-normal text-white font-roboto leading-6">
          Contact Us
        </span>
      </button>
    </div>
  );
}
