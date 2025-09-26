import { OptimizedHomeContent } from "@/components/optimized-home-content";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Musbel",
    url: "https://www.kinta-sme.com",
    description:
      "Your one-stop platform for data bundles, airtime recharge, and utility bill payments. Buy data plans, recharge airtime, pay electricity bills, and manage digital services efficiently.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.kinta-sme.com?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <OptimizedHomeContent />
    </>
  );
}
