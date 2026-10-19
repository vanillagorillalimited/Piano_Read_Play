# Read & Play: handover

Read & Play is a piano app that teaches reading sheet music and playing the piano together. It's a Vanilla Gorilla Limited product, planned for the App Store and Google Play with a free tier and a Premium subscription.

This file is for whoever picks the project up next, person or Claude. It explains what exists, how it fits together, what's been decided and what's still to do. Setup steps for Xcode, Android Studio, the stores and RevenueCat are in README.md.

## Where things are

| | |
|---|---|
| Project | This folder, which is the contents of `read-and-play-app.zip`. Run `npm install` first; `node_modules` isn't included. |
| Live preview | https://claude.ai/artifact/3ZoX99C8dt7u7AXW2nKNuW, a single-page web build in Claude, currently at Version 20. It's published from `dist/read-music.html` and declares Claude's `sample` capability with images, which Help me play uses in the preview. |
| App ID | `org.vanillagorilla.readplay`. Don't change it once the app is in the stores. |
| App name | Read & Play (the full name used in places is "Piano: Read & Play") |

## Working with Kenny

- British English throughout, in the app and in conversation.
- He likes brief, practical, honest answers. Say plainly when something isn't working or hasn't been tested, rather than putting a positive spin on it.
- Don't assume deep knowledge of music theory or native mobile tooling; explain the steps. He has 16 years in software and knows TypeScript and Expo React Native.
- Documents shouldn't read like AI: no random bold text and no hedging notes.
- He tests ideas quickly and gives direct feedback. Show results (screenshots, short summaries) rather than long write-ups.

## What the app does

- Learn: an 85-lesson course over three levels (Beginner, Intermediate, Advanced), with a Reading track and a Playing track woven together. Lessons contain explanations, scores you can play, keyboard exercises, drills and links to pieces.
- Practise: note-reading drills (adaptive, with a weak-notes mode and a note accuracy map), rhythm tapping, intervals, key signatures, scales and chords with fingering, and a metronome.
- Pieces: 79 play-along pieces in 10 levels and many styles. The play-along screen has:
  - Wait mode (the music waits for the right key) and In time mode (count-in, timing scored).
  - Hands separately, where the other hand is silent unless "Hear the other hand too" is on.
  - Tempo, bar looping and full screen.
  - An "About this piece" card: key, notes outside the key (highlighted in the music), chords with Roman numerals, hand shapes with fingering, patterns and the busiest bars to loop.
- Help me play: your own music becomes a play-along piece.
  - Photos and PDFs are read by Claude through the reading server.
  - MusicXML and MIDI files are converted on the device, free and exact.
  - Songs are kept on the device under My songs and can be edited.
- Library: note finder, symbols, keys (major and minor, with scales) and rhythms.
- Input: the on-screen piano; MIDI keyboards (USB and Bluetooth through the native plugin in the apps, Web MIDI in Chrome); and the microphone (a custom pitch and onset detector).
- Feature tours for each area, shown the first time and replayable from the ? buttons or Settings.
- Two looks: Concert Grand (dark, gold, the default) and Minimal (soft off-white and charcoal).

## How it's built

There's no framework and no bundler. Plain JavaScript files in `src/` are joined together by `build.sh`.

| File | Purpose |
|---|---|
| `src/app.js` | All screens, routing, state and actions. The big one. |
| `src/notation.js` | The text music format and VexFlow rendering (`parseMusic`, `renderScore`). |
| `src/audio.js`, `src/samples.js` | Piano sampler (embedded MP3 samples) and the player, including `heardNow()` for accurate timing. |
| `src/midi.js` | MIDI: the native plugin in the apps, Web MIDI in browsers. |
| `src/mic.js` | Microphone note detection. |
| `src/sheet.js`, `src/sheet-prompts.js`, `src/sheet-prompt.txt` | Reading photos and PDFs (see below). |
| `src/files.js` | PDF to pages, MusicXML and MIDI file import. |
| `src/analysis.js` | "About this piece": key detection, chords, shapes, patterns. |
| `src/premium.js` | RevenueCat subscriptions and `FREE_RULES` (the free/Premium line). |
| `src/data-*.js` | Course, playing lessons, pieces, symbols, technique. |
| `src/config.app.js` | App build settings: reading server URL, RevenueCat keys, terms and privacy links. |
| `src/style.css`, `src/looks.css` | Styles and the two looks. |
| `plugins/readplay-midi/` | The native MIDI plugin: Swift (CoreMIDI and Bluetooth pairing) and Java (android.media.midi and a BLE scan). |
| `server/read-sheet.mjs` | The reading server: Claude API, page cache, RevenueCat check, monthly allowance. |
| `ios/`, `android/` | Capacitor 8 projects (iOS uses Swift Package Manager). |
| `assets/` | Placeholder icon and splash. Regenerate with `npx capacitor-assets generate`. |
| `dev-tests/` | Playwright and Node test scripts (see Testing). |

`./build.sh` produces three things:

| Output | What it is |
|---|---|
| `dist/read-music.html` | The Claude preview, which loads VexFlow, pdf.js and JSZip from jsdelivr. |
| `dist/test.html` | The same, using local `node_modules`, for tests. |
| `www/` | The app build. Everything is local, including fonts from @fontsource. |

`npm run sync` builds and copies `www/` into the native projects.

### The music text format

Bars are separated by `|` and tokens by spaces.

| Token | Meaning |
|---|---|
| `c4:q` | Pitch, then a duration: w, h, q, 8, 16 or 32. |
| `.` after the duration | Dotted. |
| `t` after the duration | Triplet. |
| `~` after the duration | Tie. |
| `(c4 e4 g4):h` | A chord. |
| `r:q` | A rest. |
| `FIN` | Final barline. |

Pitches are the sounding pitch, so `f#4` in G major. The renderer works out which accidentals to show from the key. Optional extras:

- chord symbols: `[Am]`
- fingering: `@3`
- text and dynamics: `{p}`
- articulations: `^st`
- slurs and pedal: `S( … S)`, `P( … P)`
- hairpins: `<( … )<`
- octave lines: `8va( … )8va`
- clef changes: `clef=bass`

Pieces are objects with `clef` ('grand', 'treble' or 'bass'), `key`, `time`, `bpm`, and either `rh`/`lh` or `music`.

### How Help me play reads a page

1. The page is photographed or rendered from a PDF at up to 3,200 px.
2. `findSystems` straightens it and finds each line of music by detecting staff lines and the barlines that join a grand staff.
3. It sends Claude the whole page plus a high-resolution close-up of each line (at most 6 close-ups).
4. Claude writes notes as printed: line or space, plus any accidental actually printed. It replies with one JSON entry per bar, using the printed bar numbers.
5. The app checks every bar adds up. Bars that don't are sent back for a second look, with the exact problem listed.
6. The app applies the key signature, accidentals carried through the bar, and ties (`applyKeySig`). Asking Claude to apply the key itself caused wrong naturals, which is why it's done in code.
7. Bars that still don't add up get a rest at the end and a warning naming the printed bar.

Other details:

- Readings are cached by image hash, on the device and on the server, so the same page is never paid for twice.
- In the preview, reading uses Claude's `complex` tier. On the server it uses Opus (`claude-opus-5-5`) for everything; Kenny chose accuracy over cost.
- Cost is about 6p a page, around 10p with a second look.
- Premium gets 20 pages a month, enforced by the server per RevenueCat user.

### Free and Premium

| | Included |
|---|---|
| Free (`FREE_RULES` in `src/premium.js`) | Beginner course, pieces up to level 3, all of Practise and the Library, one song from MusicXML or MIDI. |
| Premium | Intermediate and Advanced, every piece, reading photos and PDFs (20 pages a month), unlimited songs. |

Kenny hasn't confirmed this split yet; ask before launch.

- Prices are set in the stores. The preview's example prices are £4.99 a month and £39.99 a year with a 7-day trial.
- RevenueCat setup: entitlement `premium`, offering `default` with monthly and annual packages.
- With no keys in `config.app.js`, an app build runs fully unlocked and Settings says so.
- In the preview, Settings → Premium → "Try the free version" shows the locked experience, and "See the upgrade screen" shows a demo paywall.

## Status

Built and tested in a browser:
- the whole app
- the offline app build
- the native MIDI path, using a mocked Capacitor plugin
- the Premium flows, using a mocked RevenueCat
- the server's subscription check and page limit, against a fake RevenueCat and a fake Claude API
- the reading pipeline, against a mocked Claude (close-ups, second look, key handling, cache)

The Android MIDI plugin was compiled with javac against stand-in Android classes. An independent review of both native plugins found no compile errors and seven runtime bugs, which were fixed.

Not yet tested on real hardware:
- iOS and Android builds in Xcode and Android Studio
- MIDI with a real keyboard
- real purchases
- the microphone on a real acoustic piano
- reading real photos with the new pipeline (the old pipeline was tried once and is why the key handling changed)
- the iOS silent-switch audio fix in `AppDelegate.swift`

## Next steps

1. Kenny's own walkthrough, to check lesson pacing and find bugs. He planned to do this as a beginner (reset progress, first 10 or so lessons) and as a tester on a real piano. Fix what he reports.
2. Build on his Mac and phones (README section 1). Expect a round of native build fixes.
3. Store setup: Apple Developer and Google Play accounts as Vanilla Gorilla Limited, subscriptions, RevenueCat, then host the reading server (README sections 3 and 4).
4. Before submitting: privacy policy and terms (microphone not recorded; photos sent to the reading server; songs kept on the device), store privacy answers, screenshots, a real icon.

Agreed improvements still to build, in Kenny's priority order:

5. Accounts and syncing progress between devices. The store is already built for this: records carry timestamps and `mergeStates` merges latest-wins.
6. Today's practice: a 10 to 15 minute daily session (lesson, drill, piece), reminders and streaks.
7. A sight-reading generator: endless new short pieces at the player's level.
8. Level checks and a placement test.
9. A tablet and music-stand layout: landscape, bigger notation, page-turn scrolling, and a night-time dark mode.
10. Beta testing (TestFlight and the Play testing track), crash reporting, a feedback button and basic analytics.

Smaller items:

- Saved songs should keep the printed bar numbers. They currently count from 1, so "bar 77" on the page is "bar 16" in the app. `cleanSheet` already receives `barNums`; the song needs to store a first bar number and the score and practice bar should use it.
- Minimal look: possible further softening, or an automatic dark mode, if Kenny still finds it bright.

## Testing

`dev-tests/` holds the Playwright (Python) scripts used throughout. They were written in a scratch folder, so before running them:

- change the paths: `file:///home/claude/notes-app/...` becomes this folder, and fixtures such as `sys/page.jpg` and `xml/...` are now in `dev-tests/fixtures/`
- run `./build.sh` so `dist/test.html` exists

| Script | What it checks |
|---|---|
| `rmall.py` | Every lesson and piece renders. |
| `rmf.py` | Settings, drills, quizzes, looks. |
| `hmp.py` | Help me play with a mocked Claude, then editing and deleting songs. |
| `read2.py` | The reading pipeline: close-ups, second look, key handling, cache, page allowance. |
| `files_test.py`, `midi_test.py` | MusicXML, MXL, PDF and MIDI import. |
| `perf.py`, `solo.py` | Play in time scoring; soloing one hand. |
| `premium_test.py` | Free version, paywall, demo and mocked RevenueCat purchase. |
| `native_midi.py` | The app build offline with a mocked native MIDI plugin. |
| `about.py`, `allpieces.py` | The About this piece card, and every piece screen opening without errors. |
| `mic_detector.py`, `validate_data.js` | The microphone detector suite (needs its WAV fixtures, not included) and a data validator. |

Many tests reach controls inside the practice options sheet through a small helper, `window.__q`, that opens the sheet first.
