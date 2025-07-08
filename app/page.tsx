import { configs } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-primary/10 to-white">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center py-16 bg-gradient-to-r from-primary/10 to-white">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-primary text-center mb-6 drop-shadow-lg">
            {configs.appName}
          </h1>
          <p className="max-w-2xl text-center text-xl text-muted-foreground mb-8">
            Welcome to {configs.appName}, Nigeria’s most reliable platform for
            affordable data bundles, instant airtime recharge, seamless bill
            payments, and exam result token purchases. Enjoy unbeatable prices,
            lightning-fast delivery, and 24/7 customer support.
          </p>
          <div className="flex gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-md px-8 py-6 text-lg font-semibold shadow-lg"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-md px-8 py-6 text-lg font-semibold"
            >
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="w-full max-w-5xl mt-20 px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            Why Choose {configs.appName}?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-4xl mb-3">⚡</span>
              <h3 className="font-semibold text-lg mb-2">Instant Delivery</h3>
              <p className="text-sm text-center text-muted-foreground">
                Get your data, airtime, and tokens delivered instantly, any time
                of the day.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-4xl mb-3">💸</span>
              <h3 className="font-semibold text-lg mb-2">Best Prices</h3>
              <p className="text-sm text-center text-muted-foreground">
                Enjoy the lowest rates on all services, with no hidden charges.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-4xl mb-3">🔒</span>
              <h3 className="font-semibold text-lg mb-2">Secure & Reliable</h3>
              <p className="text-sm text-center text-muted-foreground">
                Your transactions are protected with industry-standard security
                and encryption.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-4xl mb-3">🤝</span>
              <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
              <p className="text-sm text-center text-muted-foreground">
                Our friendly support team is always available to assist you, day
                or night.
              </p>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="w-full max-w-5xl mt-20 px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div className="bg-primary/5 rounded-lg shadow p-8 flex flex-col items-center">
              <span className="text-5xl mb-4">📱</span>
              <h3 className="font-semibold text-xl mb-2">Data & Airtime</h3>
              <ul className="text-sm text-center text-muted-foreground space-y-1">
                <li>MTN, Glo, Airtel, 9mobile</li>
                <li>SME, Corporate, Gifting & Direct</li>
                <li>Instant recharge & flexible plans</li>
              </ul>
            </div>
            <div className="bg-primary/5 rounded-lg shadow p-8 flex flex-col items-center">
              <span className="text-5xl mb-4">💡</span>
              <h3 className="font-semibold text-xl mb-2">Bill Payments</h3>
              <ul className="text-sm text-center text-muted-foreground space-y-1">
                <li>Electricity (PHCN, IKEDC, AEDC, etc.)</li>
                <li>Cable TV (DSTV, GOTV, Startimes)</li>
                <li>WAEC, NECO, JAMB ePins</li>
              </ul>
            </div>
            <div className="bg-primary/5 rounded-lg shadow p-8 flex flex-col items-center">
              <span className="text-5xl mb-4">🎓</span>
              <h3 className="font-semibold text-xl mb-2">Exam Tokens</h3>
              <ul className="text-sm text-center text-muted-foreground space-y-1">
                <li>WAEC, NECO, NABTEB, JAMB</li>
                <li>Result checker & registration tokens</li>
                <li>Instant delivery to your dashboard</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full max-w-4xl mt-20 px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            How It Works
          </h2>
          <ol className="flex flex-col sm:flex-row justify-center items-center gap-8">
            <li className="flex flex-col items-center">
              <span className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mb-2">
                1
              </span>
              <span className="font-semibold mb-1">Create Account</span>
              <span className="text-xs text-muted-foreground text-center">
                Sign up in seconds with your email or phone number.
              </span>
            </li>
            <li className="flex flex-col items-center">
              <span className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mb-2">
                2
              </span>
              <span className="font-semibold mb-1">Fund Wallet</span>
              <span className="text-xs text-muted-foreground text-center">
                Add funds via bank transfer or online payment.
              </span>
            </li>
            <li className="flex flex-col items-center">
              <span className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mb-2">
                3
              </span>
              <span className="font-semibold mb-1">Buy & Enjoy</span>
              <span className="text-xs text-muted-foreground text-center">
                Purchase data, airtime, pay bills, or buy tokens instantly.
              </span>
            </li>
          </ol>
        </section>

        {/* Testimonials */}
        <section className="w-full max-w-4xl mt-20 px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="italic mb-2">
                “Super fast delivery and the best prices I’ve seen. Highly
                recommended!”
              </p>
              <span className="font-semibold text-primary">
                — Chinedu, Lagos
              </span>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="italic mb-2">
                “Customer support is always available and helpful. I love using
                this platform!”
              </p>
              <span className="font-semibold text-primary">— Aisha, Abuja</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-10 mt-20 flex flex-col items-center text-xs text-muted-foreground border-t">
          <div>
            &copy; {new Date().getFullYear()} {configs.appName}. All rights
            reserved.
          </div>
          <div className="mt-2">
            Powered by{" "}
            <a
              href="https://abanty-data-sme-amber.vercel.app"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              KINTA SME
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
