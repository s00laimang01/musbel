'use client';

import { configs } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OptimizationProvider } from "./optimization-provider";

export function OptimizedHomeContent() {
  return (
    <OptimizationProvider>
      <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-primary/10 to-white">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center py-16 bg-gradient-to-r from-primary/10 to-white">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-primary text-center mb-6 drop-shadow-lg">
            {configs.appName}
          </h1>
          <p className="max-w-2xl text-center text-xl text-muted-foreground mb-8">
            Welcome to {configs.appName}, Nigeria's most reliable platform for
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

        {/* Features Section */}
        <section className="w-full py-16 px-4 content-block">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Data Bundles</h3>
                <p className="text-muted-foreground">
                  Purchase affordable data plans for all networks. We offer the best
                  rates for MTN, Airtel, Glo, and 9mobile.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Airtime Recharge</h3>
                <p className="text-muted-foreground">
                  Instantly recharge airtime for yourself, family, and friends at
                  discounted rates. Never run out of credit again.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Electricity Bills</h3>
                <p className="text-muted-foreground">
                  Pay electricity bills for all distribution companies. Get your
                  token instantly and keep your lights on.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Exam Results</h3>
                <p className="text-muted-foreground">
                  Purchase tokens for checking WAEC, NECO, and JAMB results. Get
                  your results without the hassle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="w-full py-16 px-4 bg-gray-50 content-block">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Reason 1 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <span className="text-primary mr-2">✓</span> Best Prices
                </h3>
                <p className="text-muted-foreground">
                  We offer the most competitive rates in the market, ensuring you
                  get the best value for your money.
                </p>
              </div>

              {/* Reason 2 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <span className="text-primary mr-2">✓</span> Instant Delivery
                </h3>
                <p className="text-muted-foreground">
                  Our automated system ensures that your purchases are delivered
                  instantly, 24/7.
                </p>
              </div>

              {/* Reason 3 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <span className="text-primary mr-2">✓</span> Reliable Support
                </h3>
                <p className="text-muted-foreground">
                  Our customer support team is always available to assist you with
                  any issues or questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 px-4 bg-primary text-white content-block">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8">
              Join thousands of satisfied customers who trust {configs.appName} for
              their digital service needs.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-md px-8 py-6 text-lg font-semibold"
            >
              <Link href="/auth/sign-up">Create an Account</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-8 px-4 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold">{configs.appName}</h3>
                <p className="text-gray-400">
                  Your one-stop solution for digital services
                </p>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="mt-8 text-center text-gray-400">
              <p>© {new Date().getFullYear()} {configs.appName}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </OptimizationProvider>
  );
}