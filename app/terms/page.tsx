import { Metadata } from "next";
import { configs } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Terms of Service - ${configs.appName}`,
  description: `Terms of service for ${configs.appName} data services and utility payments platform.`,
};

export default function TermsOfService() {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>

      <div className="space-y-6">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
          <p className="mb-4">
            Welcome to {configs.appName}. These Terms of Service ("Terms")
            govern your use of our platform, including our website, mobile
            applications, and services (collectively, the "Services").
          </p>
          <p>
            By accessing or using our Services, you agree to be bound by these
            Terms. If you do not agree to these Terms, please do not use our
            Services.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Account Registration</h2>
          <p className="mb-4">
            To use certain features of our Services, you may need to create an
            account. When you create an account, you agree to:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>
              Be responsible for all activities that occur under your account
            </li>
            <li>
              Notify us immediately of any unauthorized use of your account
            </li>
          </ul>
          <p className="mt-4">
            We reserve the right to suspend or terminate your account if any
            information provided is inaccurate, false, or no longer valid.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Services and Payments</h2>
          <p className="mb-4">
            {configs.appName} provides various services, including data bundles,
            airtime recharge, utility bill payments, and other digital services.
            By using our Services, you agree to:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Pay all fees and charges associated with your transactions</li>
            <li>Provide accurate payment information</li>
            <li>
              Verify all transaction details before confirming any purchase
            </li>
          </ul>
          <p className="mt-4">
            Prices for our Services are subject to change without notice. We
            reserve the right to refuse service to anyone for any reason at any
            time.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Service Availability and Delivery
          </h2>
          <p className="mb-4">
            While we strive to provide uninterrupted Services, we do not
            guarantee that our Services will be available at all times. We may
            experience hardware, software, or other problems, or need to perform
            maintenance related to our Services, resulting in interruptions,
            delays, or errors.
          </p>
          <p>
            We will make reasonable efforts to deliver purchased services
            promptly. However, delivery times may vary based on network
            availability, third-party service providers, and other factors
            beyond our control.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Refund Policy</h2>
          <p>
            Due to the nature of digital services, all sales are final, and we
            generally do not offer refunds once a transaction is completed. In
            cases where a service was not delivered due to a technical error on
            our part, we will either complete the delivery or provide a refund
            at our discretion. Refund requests must be submitted within 24 hours
            of the transaction.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Prohibited Activities</h2>
          <p className="mb-4">When using our Services, you agree not to:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Use our Services for fraudulent or unauthorized purposes</li>
            <li>
              Attempt to bypass any security measures or access unauthorized
              areas of our platform
            </li>
            <li>
              Use our Services to distribute malware or other harmful code
            </li>
            <li>
              Engage in any activity that disrupts or interferes with our
              Services
            </li>
          </ul>
          <p className="mt-4">
            We reserve the right to terminate your access to our Services if you
            engage in any prohibited activities.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Intellectual Property</h2>
          <p>
            All content, features, and functionality of our Services, including
            but not limited to text, graphics, logos, icons, images, audio
            clips, and software, are the exclusive property of {configs.appName}{" "}
            or its licensors and are protected by copyright, trademark, and
            other intellectual property laws. You may not reproduce, distribute,
            modify, create derivative works of, publicly display, publicly
            perform, republish, download, store, or transmit any of the material
            on our Services without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, {configs.appName} and its
            affiliates, officers, employees, agents, partners, and licensors
            shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, including but not limited to,
            loss of profits, data, use, goodwill, or other intangible losses,
            resulting from your access to or use of or inability to access or
            use the Services.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of any
            changes by posting the updated Terms on our platform or by other
            means as required by law. Your continued use of our Services after
            such modifications will constitute your acknowledgment of the
            modified Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at
            terms@musbel.com.
          </p>
        </section>

        <p className="mt-8 text-sm text-gray-500">
          Last Updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
