import AuthLayout from "@/views/auth";
import Footer from "@/views/no-auth/layout/Footer";
import Header from "@/views/no-auth/layout/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen ">
      <Header className="fixed top-0 left-0 w-full z-50" />
      <main className=" min-h-screen flex flex-col items-center justify-start overflow-y-auto">
        <div className="w-full max-w-[1440px] px-3 lg:px-0 mx-auto flex-1">
          <AuthLayout>{children}</AuthLayout>
        </div>
      </main>
      <Footer />
    </div>
  );
}
