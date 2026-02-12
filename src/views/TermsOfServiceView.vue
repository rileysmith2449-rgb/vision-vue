<template>
  <div class="legal-page">
    <div class="legal-card">
      <div class="legal-header">
        <router-link to="/" class="legal-back">&larr; Back</router-link>
        <h1>Terms of Service</h1>
        <p class="legal-meta">Vision Finance &bull; Effective: February 10, 2026</p>
      </div>

      <div class="legal-content">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Vision Finance ("the Service") at visionfinance.app, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>Vision Finance is a personal finance dashboard that aggregates data from your linked financial accounts to provide portfolio tracking, net worth analysis, budget management, and tax-smart insights. The Service connects to financial institutions through Plaid, a third-party data aggregation provider.</p>
        </section>

        <section>
          <h2>3. Eligibility</h2>
          <p>You must be at least 18 years old and a resident of the United States to use the Service. By using the Service, you represent and warrant that you meet these requirements.</p>
        </section>

        <section>
          <h2>4. Account Security</h2>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Notifying us immediately of any unauthorized access at <a href="mailto:support@visionfinance.app">support@visionfinance.app</a></li>
          </ul>
        </section>

        <section>
          <h2>5. Financial Data & Plaid</h2>
          <p>By linking your financial accounts, you authorize Vision Finance to access your financial data through Plaid. You acknowledge that:</p>
          <ul>
            <li>Vision Finance does not store your bank login credentials</li>
            <li>All credential exchange is handled by Plaid in accordance with their <a href="https://plaid.com/legal/#end-user-privacy-policy" target="_blank" rel="noopener">privacy policy</a></li>
            <li>Financial data displayed may be delayed or subject to processing times by your financial institution</li>
            <li>You can disconnect any linked account at any time</li>
          </ul>
        </section>

        <section>
          <h2>6. Not Financial Advice</h2>
          <p><strong>Vision Finance is an informational tool only.</strong> The Service does not provide financial, investment, tax, or legal advice. Any insights, projections, or recommendations displayed are for informational purposes only and should not be relied upon as the sole basis for making financial decisions.</p>
          <p>You should consult with a qualified financial advisor, tax professional, or attorney before making any financial decisions. Vision Finance is not a registered investment advisor, broker-dealer, or tax preparer.</p>
        </section>

        <section>
          <h2>7. Data Accuracy</h2>
          <p>While we strive to display accurate financial data, Vision Finance does not guarantee the accuracy, completeness, or timeliness of any information. Data is sourced from your financial institutions via Plaid and may contain errors, delays, or discrepancies. You should verify all information against your official account statements.</p>
        </section>

        <section>
          <h2>8. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems or other users' data</li>
            <li>Reverse engineer, decompile, or disassemble the Service</li>
            <li>Use automated tools to scrape or extract data from the Service</li>
            <li>Share your account access with unauthorized parties</li>
            <li>Interfere with or disrupt the Service's infrastructure</li>
          </ul>
        </section>

        <section>
          <h2>9. Intellectual Property</h2>
          <p>All content, design, code, and branding of Vision Finance are the intellectual property of Vision Finance. You may not copy, modify, distribute, or create derivative works without prior written consent.</p>
        </section>

        <section>
          <h2>10. Service Availability</h2>
          <p>We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for any loss or damage resulting from service interruptions.</p>
        </section>

        <section>
          <h2>11. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Vision Finance shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
          <ul>
            <li>Financial losses based on information displayed in the Service</li>
            <li>Loss of data or unauthorized access to your data</li>
            <li>Service interruptions or errors</li>
            <li>Actions taken based on insights or recommendations shown in the Service</li>
          </ul>
          <p>Our total liability shall not exceed the amount you paid for the Service in the twelve (12) months preceding the claim.</p>
        </section>

        <section>
          <h2>12. Indemnification</h2>
          <p>You agree to indemnify and hold harmless Vision Finance, its founder, and affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.</p>
        </section>

        <section>
          <h2>13. Termination</h2>
          <p>We reserve the right to suspend or terminate your access to the Service at any time for violation of these Terms or for any reason at our discretion. You may terminate your account at any time by contacting <a href="mailto:support@visionfinance.app">support@visionfinance.app</a>. Upon termination, your data will be handled in accordance with our <router-link to="/privacy">Privacy Policy</router-link>.</p>
        </section>

        <section>
          <h2>14. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Changes will be posted on this page with an updated effective date. Your continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
        </section>

        <section>
          <h2>15. Governing Law</h2>
          <p>These Terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of competent jurisdiction.</p>
        </section>

        <section>
          <h2>16. Contact</h2>
          <p>For questions about these Terms of Service, contact us at:</p>
          <p>
            Vision Finance<br/>
            Riley Smith, Founder & Lead Developer<br/>
            <a href="mailto:support@visionfinance.app">support@visionfinance.app</a>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 40px 20px;
}

.legal-card {
  max-width: 760px;
  margin: 0 auto;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: 48px 40px;
  background-image: var(--gradient-card);
  box-shadow: var(--shadow-glass);
}

.legal-header {
  margin-bottom: 36px;
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 24px;
}

.legal-back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--violet-pop);
  text-decoration: none;
  margin-bottom: 16px;
}

.legal-back:hover {
  text-decoration: underline;
}

.legal-header h1 {
  font-family: 'Lexend', sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.legal-meta {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.legal-content section {
  margin-bottom: 28px;
}

.legal-content h2 {
  font-family: 'Lexend', sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.legal-content h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 14px 0 8px;
}

.legal-content p {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.legal-content ul {
  padding-left: 24px;
  margin: 8px 0 12px;
}

.legal-content li {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.legal-content a {
  color: var(--violet-pop);
  text-decoration: none;
}

.legal-content a:hover {
  text-decoration: underline;
}

.legal-content strong {
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .legal-card {
    padding: 32px 20px;
  }
}
</style>
