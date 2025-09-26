import { Metadata } from "next";
import { configs } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy - ${configs.appName}`,
  description: `Privacy policy for ${configs.appName} data services and utility payments platform.`,
};

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>

      <div className="space-y-6">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
          <p className="mb-4">
            At {configs.appName}, we are committed to protecting your privacy
            and ensuring the security of your personal information. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our platform.
          </p>
          <p>
            By accessing or using our services, you agree to the terms outlined
            in this Privacy Policy. We encourage you to read this document
            carefully to understand our practices regarding your personal data.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Information We Collect
          </h2>
          <p className="mb-4">
            We may collect the following types of information:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              <strong>Personal Information:</strong> Name, email address, phone
              number, and other contact details you provide when creating an
              account or using our services.
            </li>
            <li>
              <strong>Transaction Information:</strong> Details about the
              services you purchase, including data plans, airtime, utility
              payments, and other transactions.
            </li>
            <li>
              <strong>Device Information:</strong> Information about the device
              you use to access our platform, including device type, operating
              system, and browser type.
            </li>
            <li>
              <strong>Usage Information:</strong> How you interact with our
              platform, including pages visited, features used, and time spent
              on the platform.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            How We Use Your Information
          </h2>
          <p className="mb-4">
            We use the information we collect for various purposes, including:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Providing and maintaining our services</li>
            <li>
              Processing your transactions and delivering purchased services
            </li>
            <li>Verifying your identity and preventing fraud</li>
            <li>Communicating with you about your account and transactions</li>
            <li>Improving our platform and developing new features</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Information Sharing and Disclosure
          </h2>
          <p className="mb-4">We may share your information with:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              <strong>Service Providers:</strong> Third-party companies that
              help us deliver our services, such as payment processors and
              telecommunications providers.
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law, court
              order, or governmental authority.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger,
              acquisition, or sale of assets, your information may be
              transferred as a business asset.
            </li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties for
            marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. However, no method of
            transmission over the Internet or electronic storage is 100% secure,
            and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Your Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding
            your personal information, including:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate information</li>
            <li>The right to delete your personal information</li>
            <li>The right to restrict or object to processing</li>
            <li>The right to data portability</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us using the information
            provided in the "Contact Us" section.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or for other operational, legal, or
            regulatory reasons. We will notify you of any material changes by
            posting the updated Privacy Policy on our platform or by other means
            as required by law. Your continued use of our services after such
            modifications will constitute your acknowledgment of the modified
            Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this
            Privacy Policy or our privacy practices, please contact our Data
            Protection Officer at privacy@musbel.com.
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
