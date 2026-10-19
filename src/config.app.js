/* Settings for the App Store and Google Play builds. Fill these in before building (see README.md). */
window.READ_PLAY_CONFIG = Object.assign({
  // Your reading service for Help me play (server/read-sheet.mjs), e.g. 'https://read.example.com/'
  sheetEndpoint: '',
  // RevenueCat public API keys (Project settings > API keys), and the entitlement that unlocks Premium
  revenueCat: { ios: '', android: '', entitlement: 'premium' },
  // Help me play pages each month for Premium (your server enforces the real number)
  monthlyPages: 20,
  // Shown on the upgrade screen; Apple requires both
  termsUrl: '',
  privacyUrl: ''
}, window.READ_PLAY_CONFIG || {});
