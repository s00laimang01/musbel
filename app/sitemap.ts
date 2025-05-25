import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://abanty-data-sme-amber.vercel.app",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/auth/sign-in",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/auth/sign-up",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/auth/forget-password",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/dashboard/buy-airtime",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/dashboard/buy-data",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/dashboard/data-plans",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/dashboard/transactions",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/dashboard/utility-payment",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/dashboard/wallet",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/dashboard/refer",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://abanty-data-sme-amber.vercel.app/dashboard/settings",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
