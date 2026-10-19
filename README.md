# Read & Play: the iPhone, iPad and Android apps

This folder holds the whole app:

- the app itself (`src/`)
- the iPhone/iPad project (`ios/`) and the Android project (`android/`), made with Capacitor
- the MIDI keyboard plugin (`plugins/readplay-midi/`)
- the reading service for Help me play (`server/`)

Run `./build.sh` after changing anything in `src/`. It makes:

- `www/`: the app as it goes into the iPhone and Android builds. Everything is stored inside the app, so it works offline, apart from Help me play, which needs the reading service.
- `dist/read-music.html`: the single-page version used for the Claude preview.

## 1. Build and run it on your phone

You need a Mac for the iPhone app. The Android app can be built on any computer.

**Install once**
- Xcode, latest version, from the Mac App Store. Open it once and let it install its extras.
- Node.js 22 or later (nodejs.org).
- Android Studio (developer.android.com/studio), for Android.

**Then, in this folder**
```
npm install
npm run sync          # runs ./build.sh, then copies the app into ios/ and android/
npx cap open ios      # opens Xcode
npx cap open android  # opens Android Studio
```

**In Xcode**
1. Select the App target. Under Signing & Capabilities, choose your team.
2. Add In-App Purchase with the + Capability button.
3. Plug in your iPhone or iPad and press Run.

The first build downloads Capacitor and RevenueCat through Swift Package Manager, which takes a few minutes.

**In Android Studio**
1. Wait for Gradle to finish.
2. Plug in a phone with USB debugging turned on and press Run.

The app ID is `org.vanillagorilla.readplay` (Vanilla Gorilla Limited). Use exactly this when you create the app in App Store Connect and Google Play, because it can't be changed once the app is listed.

## 2. Fill in the settings

All in `src/config.app.js`:

| Setting | What it is |
|---|---|
| `sheetEndpoint` | The address of your reading service (section 4). |
| `revenueCat.ios`, `revenueCat.android` | RevenueCat's public SDK keys (section 3). |
| `revenueCat.entitlement` | Leave it as `premium` unless you name it differently in RevenueCat. |
| `termsUrl`, `privacyUrl` | Links to your terms and privacy policy. Apple requires links to your terms and privacy policy on the upgrade screen. |

Until the RevenueCat keys are filled in, the app runs with everything unlocked, which is handy for testing. Settings says so.

## 3. Subscriptions

Payments go through Apple and Google. RevenueCat sits between the stores and the app, so the same code handles both, and it tells you who's subscribed.

**Free vs Premium.** The line between them is set in `FREE_RULES` at the top of `src/premium.js`. The free version includes:
- the Beginner course
- pieces up to level 3
- all of Practise and the Library
- one song from a MusicXML or MIDI file

Premium adds:
- the Intermediate and Advanced courses
- every piece
- reading photos and PDFs (20 pages a month)
- unlimited songs

**App Store Connect** (appstoreconnect.apple.com)
1. Agreements, Tax and Banking: sign the Paid Applications agreement and add bank and tax details. Nothing can be sold until this is done.
2. Create the app with the bundle ID above, under your Vanilla Gorilla Limited developer account.
3. Under Subscriptions, create a group called Premium with two subscriptions, for example `rp_monthly` and `rp_annual`. Set the prices, and add an introductory offer (such as a free week) to the yearly one if you want a trial.
4. Users and Access → Integrations → In-App Purchase: create a key for RevenueCat.

**Google Play Console**
1. Set up a payments profile.
2. Create the app.
3. Under Monetise → Subscriptions, create the same two products with base plans. Add a free-trial offer if you want one.
4. Create a service account for RevenueCat (RevenueCat's guide walks through it).

**RevenueCat** (app.revenuecat.com, free until you earn $2.5k a month)
1. Create a project and add the iOS app and the Android app, using the keys from above.
2. Create an entitlement called `premium` and attach all four products.
3. Create an offering called `default` with a Monthly package and an Annual package. The upgrade screen shows whatever is in this offering, with the store's real prices and trials.
4. Put the public SDK keys (they start `appl_` and `goog_`) in `src/config.app.js`. Put the secret key (it starts `sk_`) on your reading service.

**Testing purchases**
- iPhone: sign in with a Sandbox tester (App Store Connect → Users and Access → Sandbox) under Settings → Developer on the phone.
- Android: add your Google account as a licence tester in the Play Console, and upload a build to the Internal testing track.

Test purchases are free and renew every few minutes.

## 4. The reading service (Help me play)

`server/read-sheet.mjs` is a small Node server. It needs `src/sheet-prompt.txt` and `src/sheet-prompts.js` next to it, as they are here. Host it anywhere that runs Node 22, such as Render, Railway or Fly.io. Set these environment variables:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Claude API key. |
| `REVENUECAT_SECRET_KEY` | RevenueCat's secret key. With this set, only Premium subscribers get pages read. |
| `SHEET_PAGE_LIMIT` | Pages per subscriber per month. Default 20. |
| `SHEET_CACHE_DIR`, `SHEET_USAGE_FILE` | Where readings and the monthly counts are kept. Put both on a persistent disk. |

Reading uses Claude's strongest model. Expect about 6p a page, and around 10p when bars need a second look. A page someone has read before is free.

## 5. MIDI keyboards

Phones' built-in web views can't use MIDI, so the app has its own plugin (`plugins/readplay-midi`): CoreMIDI on iOS, Android's MIDI service on Android.

- **USB.** An iPhone or iPad needs Apple's USB-C or Lightning camera adapter. An Android phone needs a USB OTG adapter. The keyboard appears as soon as it's plugged in.
- **Bluetooth.** Settings → MIDI keyboard → Pair a Bluetooth keyboard.
  - On iOS this shows Apple's pairing list.
  - On Android the app scans for eight seconds and connects to any Bluetooth MIDI keyboard it finds. Android will ask for permission to find nearby devices.

## 6. Before you submit

- Privacy policy. It should say that the microphone is only used to hear the notes you play and nothing is recorded or sent anywhere. It should also say that sheet-music photos are sent to your reading service to be read, and songs are kept on the device.
- App Store "App Privacy" answers and Google Play "Data safety" answers that match the policy.
- Screenshots: iPhone 6.9" and iPad 13" for Apple, and phone and tablet for Google.
- Replace the placeholder icon (`assets/icon-only.png`, 1024×1024) if you like, then run `npx capacitor-assets generate` and `npx cap sync`.
- Raise the version in Xcode (Version and Build) and in `android/app/build.gradle` (`versionName` and `versionCode`) for each release.

## Not yet tested on real devices

Everything here was built and checked on a Linux machine. That covered:
- the app in a browser
- the MIDI plugin's Android code (compiled against stand-ins for Android's classes)
- the subscription flow and the server's subscription check, both against pretend versions of RevenueCat

These have not yet run for real:
- the iOS and Android builds themselves
- a real MIDI keyboard
- real purchases

Those need your Mac and phones. If Xcode or Android Studio shows errors, copy them back to Claude.
