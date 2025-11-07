import { siteConfig } from "@/config/site";
import { Metadata } from "next";
import { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";

export const metaObject = (
  title?: string,
  description: string = siteConfig.description,
  openGraph?: OpenGraph
): Metadata => {
  const pageTitle = title ? `${title} - ${siteConfig.name}` : siteConfig.title;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      siteName: siteConfig.name,
      images: [{ url: siteConfig.logo, width: 196, height: 66 }],
      locale: "en_US",
      type: "website",
      ...openGraph,
    },
  };
};
