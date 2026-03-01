export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">Terms &amp; Conditions</h1>
      <p className="mb-10 text-sm text-[var(--text-muted)]">Last updated: February 23, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">

        {/* General */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">1. General Terms</h2>
          <p className="mb-3">TicksBid (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides a peer-to-peer marketplace platform that enables users to buy and sell event tickets. By creating an account or using our services, you agree to be bound by these Terms &amp; Conditions.</p>
          <p className="mb-3">You must be at least 18 years of age and have the legal capacity to enter into binding agreements to use TicksBid. You are responsible for maintaining the security of your account and for all activity that occurs under your account.</p>
          <p>TicksBid acts solely as an intermediary marketplace. We are not the seller or issuer of any tickets listed on our platform. We do not guarantee event admission and are not responsible for the actions of event organizers, venues, or other users.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">2. Account Registration</h2>
          <p>To use TicksBid, you must register an account by providing a valid phone number, username, and email address. You agree to provide accurate, current, and complete information. We verify your phone number via SMS. Accounts are non-transferable. We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or remain inactive for an extended period.</p>
        </section>

        {/* Buyer */}
        <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6">
          <h2 className="mb-4 text-xl font-bold text-[var(--text-primary)]">Buyer Agreement</h2>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">3. Zero Buyer Fees</h3>
            <p>TicksBid charges zero fees to buyers. The listed price or winning bid amount is the total price you pay, with no service fees, delivery fees, or hidden charges added at checkout.</p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">4. Purchasing Tickets</h3>
            <p className="mb-3">There are two ways to acquire tickets on TicksBid:</p>
            <p className="mb-2"><strong className="text-[var(--text-primary)]">Buy Now:</strong> If a seller has set a buy-it-now price, you may purchase the ticket immediately at that price. The transaction is binding upon confirmation.</p>
            <p><strong className="text-[var(--text-primary)]">Place a Bid:</strong> You may bid on any active listing before the auction end time. You may set a maximum auto-bid amount and the system will incrementally bid on your behalf up to that limit. The highest bid at or above the reserve price (if set) wins when the auction ends. Bids are binding commitments to purchase.</p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">5. Payment</h3>
            <p>Payment is processed at the time of a Buy Now purchase or when you win an auction. We accept credit cards, debit cards, and USDC (on Solana). Payment must be completed within 24 hours of winning an auction. Failure to pay may result in account suspension.</p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">6. Ticket Delivery</h3>
            <p>Tickets are transferred to your account upon successful payment. The method of delivery depends on the ticket type (digital transfer, mobile ticket, PDF, etc.). Sellers are required to transfer tickets within 24 hours of payment confirmation. If a seller fails to deliver, you are eligible for a full refund.</p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">7. Buyer Guarantee</h3>
            <p>TicksBid guarantees that tickets purchased through our platform are valid for entry to the event. If a ticket is determined to be fraudulent, invalid, or not as described, we will provide a full refund or comparable replacement tickets at our discretion. This guarantee does not cover events that are canceled, postponed, or rescheduled by the event organizer.</p>
          </section>
        </div>

        {/* Seller */}
        <div className="rounded-xl border border-[var(--green)]/20 bg-[var(--green)]/5 p-6">
          <h2 className="mb-4 text-xl font-bold text-[var(--text-primary)]">Seller Agreement</h2>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">8. Listing Tickets</h3>
            <p>To list a ticket, you must be the rightful owner or authorized holder. Each listing requires an auction end time. You may optionally set a reserve price (minimum acceptable bid) and a buy-it-now price (instant purchase option). You represent and warrant that all tickets listed are authentic, valid, and will be delivered as described. Listing counterfeit, stolen, or unauthorized tickets is strictly prohibited and will result in permanent account suspension.</p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">9. Seller Fees</h3>
            <p className="mb-3">TicksBid charges sellers a volume-weighted fee on completed transactions. Fees are deducted from the sale proceeds before payout:</p>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 my-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-[var(--text-muted)]">1–5 sales/month</span><span className="text-[var(--text-primary)] font-semibold">8%</span>
                <span className="text-[var(--text-muted)]">6–20 sales/month</span><span className="text-[var(--text-primary)] font-semibold">6%</span>
                <span className="text-[var(--text-muted)]">21–50 sales/month</span><span className="text-[var(--text-primary)] font-semibold">4.5%</span>
                <span className="text-[var(--text-muted)]">51+ sales/month</span><span className="text-[var(--text-primary)] font-semibold">3%</span>
              </div>
            </div>
            <p>Fee tiers reset monthly. Volume is calculated based on the number of completed transactions in the current calendar month.</p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">10. Delivery Obligations</h3>
            <p>Upon receiving payment, you must transfer the ticket to the buyer within 24 hours. Failure to deliver tickets may result in automatic refund to the buyer, forfeiture of sale proceeds, account suspension, and/or a strike on your seller account. Three delivery failures result in permanent suspension.</p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">11. Payouts</h3>
            <p>Net proceeds (sale price minus seller fee) are disbursed via your chosen payout method. Bank transfers are processed within 24 hours of confirmed ticket delivery. USDC payouts are sent instantly upon delivery confirmation. You are responsible for any taxes applicable to your sales.</p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">12. Auction Rules for Sellers</h3>
            <p>Once a listing receives a bid at or above the reserve price, the listing cannot be canceled. If no reserve is set, any bid is binding. You are obligated to complete the sale to the highest bidder when the auction ends. Manipulating auctions (shill bidding, bid shielding) is prohibited and grounds for permanent suspension.</p>
          </section>
        </div>

        {/* General continued */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">13. Refund &amp; Cancellation Policy</h2>
          <p className="mb-3"><strong className="text-[var(--text-primary)]">Event cancellation:</strong> If an event is canceled by the organizer and the organizer offers refunds, TicksBid will facilitate the return of funds. If the organizer does not offer refunds, TicksBid is not obligated to provide one, though we will make reasonable efforts to assist.</p>
          <p className="mb-3"><strong className="text-[var(--text-primary)]">Event postponement:</strong> If an event is postponed, tickets remain valid for the rescheduled date. No refund is issued unless the buyer cannot attend the new date, in which case the ticket may be relisted.</p>
          <p><strong className="text-[var(--text-primary)]">Buyer disputes:</strong> If you believe a ticket is not as described, you may file a dispute within 48 hours of the event date. Our support team will investigate and issue a resolution within 5 business days.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">14. Prohibited Conduct</h2>
          <p>Users may not: list or sell counterfeit, stolen, or unauthorized tickets; manipulate auctions through shill bidding or collusion; create multiple accounts to circumvent fee tiers or suspensions; use automated tools to scrape data or manipulate the platform without authorization; harass, threaten, or defraud other users; violate any applicable local, state, national, or international law; or interfere with the proper functioning of the platform.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">15. API &amp; Agent Usage</h2>
          <p>TicksBid provides a REST API and MCP server for programmatic access. Users who authorize AI agents or third-party applications to access their account via delegated authentication tokens are fully responsible for all actions taken by those agents. API usage is subject to rate limits and acceptable use policies. Abuse of the API may result in token revocation and account suspension.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">16. Limitation of Liability</h2>
          <p>TicksBid is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law, TicksBid shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to lost profits, loss of data, or inability to attend an event. Our total liability for any claim shall not exceed the amount you paid to TicksBid in fees during the 12 months preceding the claim.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">17. Dispute Resolution</h2>
          <p>Any dispute arising out of or relating to these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. Arbitration shall take place in New York, NY. You agree to waive any right to participate in a class action lawsuit or class-wide arbitration.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">18. Modifications</h2>
          <p>We may modify these Terms at any time by posting updated terms on our platform. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. Continued use of TicksBid after changes take effect constitutes acceptance of the revised terms.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">19. Contact</h2>
          <p>For questions about these Terms &amp; Conditions, contact us at support@ticksbid.com or (212) 555-1234.</p>
        </section>
      </div>
    </div>
  );
}
