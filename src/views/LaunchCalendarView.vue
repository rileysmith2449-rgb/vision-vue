<template>
  <div class="legal-page">
    <div class="legal-card">
      <div class="legal-header">
        <router-link to="/" class="legal-back">&larr; Back</router-link>
        <h1>FinApp Launch Calendar</h1>
        <p class="legal-meta">Vision Finance &bull; Updated: February 21, 2026</p>
      </div>

      <div class="legal-content">
        <section>
          <p>This is the public launch roadmap for the Vision Finance mobile app. All dates are targets and may shift as development progresses.</p>
        </section>

        <div class="timeline">
          <div class="timeline-item" :class="{ completed: isPast('2026-02-21') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Feb 21</span>
              <h3>Web App Stable</h3>
              <p>Core web platform finalized &mdash; dashboard, net worth, budget, cashflow, goals, tax insights, and card optimizer all live at visionfinance.app.</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: isPast('2026-02-22') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Feb 22 &ndash; 23</span>
              <h3>Capacitor Native Shell</h3>
              <p>iOS and Android native projects configured. Safe area handling, status bar theming, keyboard behavior, and CORS/API routing finalized.</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: isPast('2026-02-24') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Feb 24 &ndash; 25</span>
              <h3>Apple Developer Setup</h3>
              <p>Enroll in the Apple Developer Program ($99/yr). Register the app bundle ID <code>app.visionfinance.vision</code>. Create distribution certificate and provisioning profile.</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: isPast('2026-02-26') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Feb 26 &ndash; 27</span>
              <h3>CI/CD Pipeline &mdash; GitHub Actions iOS Builds</h3>
              <p>Configure GitHub Actions with macOS runners to build the iOS .ipa and upload to TestFlight automatically. No local Mac required.</p>
              <div class="substeps">
                <h4>Setup Steps</h4>
                <ol>
                  <li><strong>Apple Developer Account</strong> &mdash; Enroll at developer.apple.com and wait for approval.</li>
                  <li><strong>Register App</strong> &mdash; Create App ID with bundle ID <code>app.visionfinance.vision</code> in the Developer portal, then create the app in App Store Connect.</li>
                  <li><strong>Signing Certificate</strong> &mdash; On any Mac, open Keychain Access, request a certificate, upload to Apple Developer portal to create an Apple Distribution certificate, then export as .p12.</li>
                  <li><strong>Provisioning Profile</strong> &mdash; In the Developer portal, create an App Store Connect distribution profile for your app and certificate. Download the .mobileprovision file.</li>
                  <li><strong>App Store Connect API Key</strong> &mdash; Go to Users and Access &rarr; Integrations &rarr; generate an API key with App Manager role. Save the Key ID, Issuer ID, and .p8 file.</li>
                  <li><strong>Base64 Encode Files</strong> &mdash; Run <code>base64 -w 0 certificate.p12 > p12.txt</code>, same for the provisioning profile and .p8 key.</li>
                  <li><strong>Add GitHub Secrets</strong> &mdash; In your repo Settings &rarr; Secrets &rarr; Actions, add: <code>IOS_P12_BASE64</code>, <code>IOS_P12_PASSWORD</code>, <code>KEYCHAIN_PASSWORD</code>, <code>IOS_PROVISIONING_PROFILE_BASE64</code>, <code>IOS_PROVISIONING_PROFILE_NAME</code>, <code>APP_STORE_KEY_ID</code>, <code>APP_STORE_ISSUER_ID</code>, <code>APP_STORE_API_KEY_BASE64</code>.</li>
                  <li><strong>Trigger Build</strong> &mdash; Push to main or manually trigger the "iOS Build" workflow in GitHub Actions.</li>
                </ol>
              </div>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: isPast('2026-02-28') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Feb 28</span>
              <h3>Android Build &amp; Local Testing</h3>
              <p>Build and test the Android app locally via Android Studio. Validate all screens, navigation, Plaid link flow, and native plugins on a physical device or emulator.</p>
            </div>
          </div>

          <div class="timeline-item milestone" :class="{ completed: isPast('2026-03-01') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Mar 1</span>
              <h3>Testing Begins</h3>
              <p>First TestFlight build available for iOS beta testers. Android APK distributed to testers. Begin structured QA across both platforms.</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: isPast('2026-03-07') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Mar 1 &ndash; 7</span>
              <h3>Beta Testing &amp; Bug Fixes</h3>
              <p>Collect feedback from beta testers. Fix critical bugs, polish UI edge cases, and validate financial data accuracy across device sizes.</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: isPast('2026-03-10') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Mar 8 &ndash; 10</span>
              <h3>App Store Submission</h3>
              <p>Prepare App Store listing &mdash; screenshots, description, privacy policy link. Submit to Apple for review. Upload Android build to Google Play Console.</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: isPast('2026-03-14') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Mar 10 &ndash; 14</span>
              <h3>App Review Period</h3>
              <p>Apple review typically takes 1&ndash;3 days. Google Play review is usually faster. Address any review feedback promptly.</p>
            </div>
          </div>

          <div class="timeline-item milestone" :class="{ completed: isPast('2026-03-15') }">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-date">Mar 15</span>
              <h3>Public Launch</h3>
              <p>Vision Finance goes live on the App Store and Google Play. Announce to users and begin monitoring crash reports and analytics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isPast = (dateStr) => {
  return new Date() >= new Date(dateStr + 'T00:00:00')
}
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

.legal-content p {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 32px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--border-glass);
}

.timeline-item {
  position: relative;
  margin-bottom: 32px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -28px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--text-tertiary);
  z-index: 1;
}

.timeline-item.completed .timeline-marker {
  background: var(--green, #34d399);
  border-color: var(--green, #34d399);
}

.timeline-item.milestone .timeline-marker {
  width: 18px;
  height: 18px;
  left: -30px;
  top: 2px;
  border-color: var(--violet-pop);
  background: var(--violet-pop);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
}

.timeline-item.milestone.completed .timeline-marker {
  background: var(--green, #34d399);
  border-color: var(--green, #34d399);
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.2);
}

.timeline-date {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--violet-pop);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.timeline-content h3 {
  font-family: 'Lexend', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.timeline-item.milestone .timeline-content h3 {
  font-size: 1.15rem;
  color: var(--violet-pop);
}

.timeline-content p {
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.timeline-content code {
  font-size: 0.8rem;
  background: rgba(139, 92, 246, 0.1);
  color: var(--violet-pop);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Substeps */
.substeps {
  margin-top: 16px;
  padding: 16px 20px;
  background: rgba(139, 92, 246, 0.04);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg, 12px);
}

.substeps h4 {
  font-family: 'Lexend', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.substeps ol {
  padding-left: 20px;
  margin: 0;
}

.substeps li {
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.substeps li:last-child {
  margin-bottom: 0;
}

.substeps li strong {
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .legal-card {
    padding: 32px 20px;
  }

  .timeline {
    padding-left: 28px;
  }

  .substeps {
    padding: 12px 14px;
  }
}
</style>
