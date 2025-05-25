import { configs } from "@/lib/constants";
import { PATHS } from "@/types";
import { redirect } from "next/navigation";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: configs.appName,
    url: "https://abanty-data-sme-amber.vercel.app",
    description:
      "Your one-stop platform for data bundles, airtime recharge, and utility bill payments. Buy data plans, recharge airtime, pay electricity bills, and manage digital services efficiently.",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://abanty-data-sme-amber.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  redirect(PATHS.HOME);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        {configs.appName}
      </div>
    </>
  );
}
