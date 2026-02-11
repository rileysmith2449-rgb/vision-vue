<template>
  <div class="legal-page">
    <div class="legal-card">
      <div class="legal-header">
        <router-link to="/" class="legal-back">&larr; Back</router-link>
        <h1>Privacy Policy</h1>
        <p class="legal-meta">Vision Finance &bull; Effective: February 11, 2026</p>
      </div>

      <div class="legal-content">
        <section>
          <h2>1. Introduction</h2>
          <p>Vision Finance ("we," "our," or "us") operates the Vision platform at visionfinance.app. This Privacy Policy explains how we collect, use, store, and protect your information when you use our service.</p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Financial Account Data</h3>
          <p>When you connect your financial accounts through Plaid, we access:</p>
          <ul>
            <li>Account balances and types</li>
            <li>Transaction history (amounts, dates, merchants, categories)</li>
            <li>Investment holdings (securities, quantities, values)</li>
            <li>Liability information (credit cards, loans, balances)</li>
          </ul>
          <p>We do <strong>not</strong> collect or store your bank login credentials. All credential exchange is handled securely by Plaid.</p>

          <h3>2.2 Authentication Data</h3>
          <p>We use Descope as our authentication provider. When you create an account, Descope collects your email address, password hash, and multi-factor authentication credentials (such as TOTP secrets). We do not store passwords or MFA secrets directly — all authentication data is managed by Descope's infrastructure.</p>

          <h3>2.3 Usage Data</h3>
          <p>We may collect anonymous usage analytics to improve the platform, including pages visited and feature usage patterns.</p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>Your data is used exclusively to:</p>
          <ul>
            <li>Display your portfolio holdings, net worth, and asset allocation</li>
            <li>Provide budget tracking and spending analysis</li>
            <li>Generate tax-smart insights and recommendations</li>
            <li>Maintain and improve the platform's functionality</li>
          </ul>
          <p>We do <strong>not</strong> sell, rent, or share your personal financial data with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <h3>4.1 Plaid</h3>
          <p>We use Plaid to connect to your financial institutions. Plaid's use of your data is governed by their <a href="https://plaid.com/legal/#end-user-privacy-policy" target="_blank" rel="noopener">End User Privacy Policy</a>. Plaid is SOC 2 Type II certified and PCI DSS compliant.</p>

          <h3>4.2 Descope</h3>
          <p>We use Descope for user authentication, including email/password sign-in and multi-factor authentication (TOTP). Descope processes your email address, password hash, and MFA credentials. Descope's use of your data is governed by their <a href="https://www.descope.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>. Descope is SOC 2 Type II certified.</p>

          <h3>4.3 Hosting & Infrastructure</h3>
          <p>Our application is hosted on Vercel (SOC 2 Type II certified) with DNS and security managed by Cloudflare (SOC 2 Type II, ISO 27001 certified).</p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul>
            <li>All data in transit is encrypted using TLS 1.2 or higher</li>
            <li>Plaid access tokens are encrypted at rest using AES-256 encryption</li>
            <li>API keys and secrets are stored in secure environment variables, never in source code</li>
            <li>Infrastructure is protected by Cloudflare's DDoS mitigation and WAF</li>
            <li>Regular security audits and dependency vulnerability scanning</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention & Disposal Policy</h2>
          <p>We retain your data only as long as necessary to provide our services. The following retention schedule applies:</p>

          <h3>6.1 Financial Account Data</h3>
          <ul>
            <li><strong>Plaid access tokens:</strong> Retained while the account connection is active. Immediately revoked and permanently deleted when you disconnect an institution or delete your account.</li>
            <li><strong>Transaction and balance data:</strong> Cached only for the duration of your active session. No transaction data is persisted to long-term storage.</li>
            <li><strong>Investment holdings and liability data:</strong> Same as transaction data — session-only, not stored at rest.</li>
          </ul>

          <h3>6.2 Authentication Data</h3>
          <ul>
            <li><strong>Account credentials:</strong> Managed by Descope. Deleted when you delete your account. Descope retains authentication logs for up to 30 days for security purposes.</li>
            <li><strong>Session tokens:</strong> Automatically expire and are cleared on logout or browser close.</li>
          </ul>

          <h3>6.3 Disposal Procedures</h3>
          <p>When data reaches the end of its retention period or you request deletion:</p>
          <ul>
            <li>Plaid access tokens are revoked via Plaid's API and deleted from our systems</li>
            <li>Authentication records are deleted from Descope's infrastructure</li>
            <li>Any cached data in browser storage is cleared</li>
            <li>Anonymized, aggregated analytics data may be retained indefinitely as it cannot be linked back to individual users</li>
          </ul>

          <h3>6.4 Account Deletion</h3>
          <p>You may request full account deletion at any time by contacting <a href="mailto:support@visionfinance.app">support@visionfinance.app</a>. Upon receiving your request, we will:</p>
          <ul>
            <li>Revoke all Plaid access tokens within 24 hours</li>
            <li>Delete your Descope authentication account within 24 hours</li>
            <li>Confirm deletion via email within 5 business days</li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> your data stored in our systems</li>
            <li><strong>Disconnect</strong> any linked financial institution at any time</li>
            <li><strong>Delete</strong> your account and all associated data</li>
            <li><strong>Request</strong> a copy of your data in a portable format</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:support@visionfinance.app">support@visionfinance.app</a>.</p>
        </section>

        <section>
          <h2>8. Cookies & Local Storage</h2>
          <p>We use cookies and local storage for the following purposes:</p>
          <ul>
            <li><strong>Authentication cookies:</strong> Set by Descope to maintain your signed-in session. These are essential for the service to function.</li>
            <li><strong>Theme preference:</strong> Stored in local storage to remember your light/dark mode selection.</li>
            <li><strong>Budget settings:</strong> Stored in local storage to persist your budget mode and tax configuration.</li>
          </ul>
          <p>We do not use third-party tracking cookies or advertising cookies.</p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>Vision Finance is not intended for users under the age of 18. We do not knowingly collect data from minors.</p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>For questions or concerns about this Privacy Policy, contact us at:</p>
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
  backdrop-filter: blur(20px);
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
