export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">Privacy Policy</h1>
      <p className="mb-10 text-sm text-[var(--text-muted)]">Last updated: February 23, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">1. Introduction</h2>
          <p>TicksBid (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the TicksBid platform, including our website, mobile applications, and API services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services. By accessing or using TicksBid, you agree to the terms of this Privacy Policy.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">2. Information We Collect</h2>
          <p className="mb-3"><strong className="text-[var(--text-primary)]">Account Information:</strong> When you create an account, we collect your phone number, username, and email address. Phone numbers are verified via SMS through our third-party verification provider (Twilio).</p>
          <p className="mb-3"><strong className="text-[var(--text-primary)]">Transaction Data:</strong> When you buy, sell, or bid on tickets, we collect details of those transactions including ticket information, prices, payment method details (last four digits only), and timestamps.</p>
          <p className="mb-3"><strong className="text-[var(--text-primary)]">Usage Data:</strong> We automatically collect information about how you interact with our platform, including pages visited, search queries, IP address, browser type, device information, and referring URLs.</p>
          <p><strong className="text-[var(--text-primary)]">Payment Information:</strong> Payment processing is handled by third-party payment processors. We do not store full credit card numbers, bank account numbers, or cryptocurrency private keys on our servers. We retain only the information necessary to display transaction history and process refunds.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">3. How We Use Your Information</h2>
          <p className="mb-2">We use the information we collect to:</p>
          <p>Provide, maintain, and improve our services; process transactions and send related notifications; verify your identity and prevent fraud; communicate with you about your account, transactions, and platform updates; personalize your experience and deliver relevant content; comply with legal obligations and enforce our terms; and analyze usage patterns to improve our platform.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">4. Information Sharing</h2>
          <p className="mb-3">We do not sell your personal information. We may share your information with: service providers who assist in operating our platform (payment processors, SMS verification, hosting providers); other users as necessary to complete transactions (e.g., a buyer may see a seller&apos;s username); law enforcement or government agencies when required by law or to protect our rights; and in connection with a merger, acquisition, or sale of assets.</p>
          <p>When you list a ticket for sale or place a bid, your username and relevant transaction details are visible to other users involved in that transaction.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">5. Data Security</h2>
          <p>We implement industry-standard security measures to protect your information, including encryption in transit (TLS/SSL), encrypted storage for sensitive data, and regular security audits. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">6. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and associated data by contacting support@ticksbid.com.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to: access the personal information we hold about you; request correction of inaccurate data; request deletion of your data; opt out of marketing communications; and data portability. To exercise any of these rights, contact us at support@ticksbid.com.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">8. Cookies &amp; Tracking</h2>
          <p>We use essential cookies to maintain your session and preferences. We may use analytics tools to understand how our platform is used. You can control cookie settings through your browser, though disabling essential cookies may affect platform functionality.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">9. Third-Party Services</h2>
          <p>Our platform integrates with third-party services including Twilio (phone verification), payment processors, and hosting providers. Each of these services has its own privacy policy governing the use of your information. We encourage you to review their policies.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">10. API &amp; Agent Access</h2>
          <p>If you use our API or authorize an AI agent to act on your behalf, the agent will have access to your account data as permitted by your delegated authentication token. You are responsible for the actions taken by any agent you authorize. We log all API access for security purposes.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">11. Children&apos;s Privacy</h2>
          <p>TicksBid is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a minor, we will take steps to delete it promptly.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">12. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our platform and updating the &quot;Last updated&quot; date. Your continued use of TicksBid after changes are posted constitutes acceptance of the revised policy.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">13. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or our data practices, contact us at support@ticksbid.com or (212) 555-1234.</p>
        </section>
      </div>
    </div>
  );
}
