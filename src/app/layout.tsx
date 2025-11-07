"use client";

import "./globals.css";
import "./meal.css";
import {
  geistSans,
  geistMono,
  raleway,
  nunito,
  roboto,
  playfairDisplay,
  manrope,
  poppins,
  inter,
  lato,
} from "@/config/fonts";
import Script from "next/script";
import cn from "@/utils/functions/class-name";
import { UserInitializer } from "@/utils/functions/UserInitializer";
import { Provider } from "jotai";
import { ReactQueryClientProvider } from "./react-query-provider";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          raleway.variable,
          nunito.variable,
          roboto.variable,
          playfairDisplay.variable,
          manrope.variable,
          poppins.variable,
          inter.variable,
          lato.variable,
          "antialiased"
        )}
        suppressHydrationWarning
      >
        <Provider>
          <UserInitializer />

          <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Provider>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LS8RKCKZ2L"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());
             gtag('config', 'G-LS8RKCKZ2L');
           `}
        </Script>

        {/* Odoo Live Chat Scripts */}
        <Script
          src="https://odoo.travulu.in/im_livechat/loader/2"
          strategy="afterInteractive"
        />
        <Script
          src="https://odoo.travulu.in/im_livechat/assets_embed.js"
          strategy="afterInteractive"
        />

        {/* JSON-LD WebSite */}
        <Script
          id="json-ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {`
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Travulu",
          "url": "https://travulu.com/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://travulu.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }
        `}
        </Script>

        <Script
          id="json-ld-breadcrumb"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {`
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://travulu.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Flights",
              "item": "https://travulu.com/flight"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Buses",
              "item": "https://travulu.com/bus"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "Hotels",
              "item": "https://travulu.com/hotel"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Travel Essentials",
              "item": "https://travulu.com/shop"
            },
            {
              "@type": "ListItem",
              "position": 6,
              "name": "Gigs",
              "item": "https://travulu.com/gigs"
            }
          ]
        }
        `}
        </Script>
      </body>
    </html>
  );
}
