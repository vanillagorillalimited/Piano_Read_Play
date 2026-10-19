/* ============================================================
   The Playing track: technique and musicianship lessons, woven
   between the reading lessons so both skills grow together.
   Lesson ids are permanent: progress is keyed by them.
   ============================================================ */
const TX = (type, key, hands) => techExercise(type, key, hands).spec;
const C_POS_RH = { c4: 1, d4: 2, e4: 3, f4: 4, g4: 5 };
const C_POS_LH = { c3: 5, d3: 4, e3: 3, f3: 2, g3: 1 };

const PLAY_LESSONS = [
  /* ---------------- Beginner ---------------- */
  { before: 'b1-keyboard', lesson: {
    id: 'bp-sit', title: 'Sitting at the piano', mins: 5,
    goal: 'Set up your seat, posture and arms so playing feels easy.',
    blocks: [
      { t: 'p', x: 'Good playing starts before you touch a key. Sit badly and your shoulders and wrists tense up, and tense hands play slowly and unevenly.' },
      { t: 'steps', x: ['Sit on the front half of the bench or chair, facing middle C.', 'Set the height so your forearms are level with the keys, or slope very slightly down towards them.', 'Sit far enough back that your elbows are a little in front of your body when your hands are on the keys.', 'Keep both feet flat on the floor. Later, your right foot will work the sustain pedal.', 'Let your shoulders drop. Your arms hang loosely from them; nothing should feel held up.'] },
      { t: 'tip', x: 'With a keyboard on a table or stand the same rules apply: forearms level with the keys. A cushion on the chair is fine.' },
      { t: 'checklist', key: 'bp-sit', items: ['Forearms level with the keys', 'Feet flat, shoulders relaxed', 'Sitting facing middle C'] }
    ] } },
  { after: 'b1-keyboard', lesson: {
    id: 'bp-hands', title: 'Finger numbers and hand shape', mins: 8,
    goal: 'Know the finger numbers and make a relaxed, rounded hand.',
    blocks: [
      { t: 'p', x: 'Piano music numbers your fingers, not the keys. Thumbs are 1 and little fingers are 5, on both hands. The small numbers you will see above notes tell you which finger to use.' },
      { t: 'hands', caption: 'The same numbers on both hands: thumb 1, index 2, middle 3, ring 4, little finger 5.' },
      { t: 'p', x: 'Now the shape. Let your arms hang by your sides, then lift your hands onto the keys without changing their shape. The fingers curve naturally, as if holding a small ball.' },
      { t: 'list', x: ['Play on the pads of the fingertips, not the flat of the finger.', 'The thumb plays on its side, near the nail.', 'Keep the wrist level with the back of the hand: not drooping, not raised.', 'Keep the knuckles firm so the fingers don’t collapse.'] },
      { t: 'keys', title: 'Right hand: thumb on middle C', from: 48, to: 72, labels: 'c', fingers: C_POS_RH },
      { t: 'play', id: 'bp-hands-rh', title: 'Each finger in turn', spec: { clef: 'treble', time: '4/4', music: 'c4:q@1 d4@2 e4@3 f4@4 | g4:w@5 | g4:q@5 f4@4 e4@3 d4@2 | c4:w@1 FIN' }, bpm: 72 },
      { t: 'tip', x: 'Press each key to the bottom and let the finger rise with the key. You don’t need to hit hard; the weight of your arm is enough.' }
    ] } },
  { after: 'b2-keys', lesson: {
    id: 'bp-rh-c', title: 'Right hand in C position', mins: 10,
    goal: 'Play five-finger tunes in C position, reading by step and skip.',
    blocks: [
      { t: 'p', x: 'C position means your right thumb on middle C and one finger on each key up to G. Every note from C to G has its own finger, so you can play without looking down.' },
      { t: 'keys', title: 'C position, right hand', from: 48, to: 72, labels: 'c', fingers: C_POS_RH },
      { t: 'p', x: 'Read the notes and let the fingers follow: a step is the next finger, a skip jumps over one finger.' },
      { t: 'play', id: 'bp-rhc-steps', title: 'Steps', spec: { clef: 'treble', time: '4/4', music: 'c4:q d4 e4 c4 | d4 e4 f4 d4 | e4 f4 g4 e4 | f4 e4 d4:h | e4:q d4 c4:h FIN' }, bpm: 76 },
      { t: 'play', id: 'bp-rhc-skips', title: 'Skips', spec: { clef: 'treble', time: '4/4', music: 'c4:q e4 g4 e4 | d4 f4 e4:h | c4:q e4 d4 f4 | e4 d4 c4:h FIN' }, bpm: 76 },
      { t: 'tip', x: 'Keep your eyes on the music. If you lose your place, feel for the group of two black keys: your thumb sits just to the left of it.' },
      { t: 'piece', id: 'p-ode' }
    ] } },
  { after: 'b3-keys', lesson: {
    id: 'bp-lh-c', title: 'Left hand in C position', mins: 10,
    goal: 'Play with the left hand: little finger on C, thumb on G.',
    blocks: [
      { t: 'p', x: 'The left hand mirrors the right. In C position the little finger (5) sits on the C below middle C, and the thumb (1) on G. Going up the keyboard, the finger numbers go down: 5, 4, 3, 2, 1.' },
      { t: 'keys', title: 'C position, left hand', from: 36, to: 60, labels: 'c', fingers: C_POS_LH },
      { t: 'play', id: 'bp-lhc-updown', title: 'Up and down', spec: { clef: 'bass', time: '4/4', music: 'c3:q@5 d3@4 e3@3 f3@2 | g3:w@1 | g3:q@1 f3@2 e3@3 d3@4 | c3:w@5 FIN' }, bpm: 72 },
      { t: 'play', id: 'bp-lhc-skips', title: 'Steps and skips', spec: { clef: 'bass', time: '4/4', music: 'c3:q e3 g3 e3 | f3 d3 e3:h | g3:q f3 e3 d3 | c3:w FIN' }, bpm: 72 },
      { t: 'tip', x: 'The left hand is usually weaker at first. Give it extra practice, and keep the little finger curved rather than letting it lie flat.' },
      { t: 'piece', id: 'p-five-finger-lh' }
    ] } },
  { after: 'b4-grand', lesson: {
    id: 'bp-together', title: 'Both hands at once', mins: 10,
    goal: 'Play both hands together, first mirroring each other, then moving the same way.',
    blocks: [
      { t: 'p', x: 'Playing hands together is a new skill for your brain, so start with patterns where the hands help each other.' },
      { t: 'p', x: 'In contrary motion the hands move in opposite directions with the same finger numbers: both thumbs, then both second fingers, and so on. Here the thumbs start an octave apart, on C4 and C3.' },
      { t: 'play', id: 'bp-tog-mirror', title: 'Mirror image', spec: { clef: 'grand', time: '4/4', rh: 'c4:q@1 d4@2 e4@3 f4@4 | g4:h@5 e4@3 | d4:q@2 c4@1 d4 e4 | c4:w@1 FIN', lh: 'c3:q@1 b2@2 a2@3 g2@4 | f2:h@5 a2@3 | b2:q@2 c3@1 b2 a2 | c3:w@1 FIN' }, bpm: 66 },
      { t: 'p', x: 'In parallel motion both hands move the same way. Now the finger numbers don’t match, which is harder. Go slowly.' },
      { t: 'play', id: 'bp-tog-parallel', title: 'Parallel: both hands in C position', spec: { clef: 'grand', time: '4/4', rh: 'c4:q@1 d4 e4 f4 | g4:w | g4:q f4 e4 d4 | c4:w FIN', lh: 'c3:q@5 d3 e3 f3 | g3:w | g3:q f3 e3 d3 | c3:w FIN' }, bpm: 66 },
      { t: 'h', x: 'How to learn anything hands together' },
      { t: 'steps', x: ['Play the right hand alone until it’s easy.', 'Play the left hand alone until it’s easy.', 'Put them together very slowly, one beat at a time.', 'Only speed up once it’s right three times in a row.'] },
      { t: 'piece', id: 'p-c-scale' }
    ] } },
  { after: 'b5-values', lesson: {
    id: 'bp-pulse', title: 'Keeping a steady beat', mins: 8,
    goal: 'Count while you play and keep the beat even, using a metronome.',
    blocks: [
      { t: 'p', x: 'The biggest difference between a beginner and a musician is a steady beat. Playing slowly and evenly is better than playing quickly with stops and starts.' },
      { t: 'steps', x: ['Count out loud: 1 2 3 4, one number per beat.', 'Long notes still get every count: a minim lasts 1 2, a semibreve 1 2 3 4.', 'Use the metronome in the Practise tab. Start at 60 beats per minute.', 'If you make a mistake, keep going. Don’t go back to fix it; fix it next time through.'] },
      { t: 'play', id: 'bp-pulse-hold', title: 'Count and hold', spec: { clef: 'treble', time: '4/4', music: 'c4:q d4 e4:h | g4:w | f4:q e4 d4:h | c4:w FIN' }, bpm: 66 },
      { t: 'tip', x: 'Tap your foot or nod on each beat. When the beat lives in your body, your fingers follow it.' }
    ] } },
  { after: 'b5-quavers', lesson: {
    id: 'bp-touch', title: 'Smooth and short: legato and staccato', mins: 8,
    goal: 'Join notes smoothly, or play them short and bouncy.',
    blocks: [
      { t: 'p', x: 'Legato means smooth and connected: the next key goes down just as the last one comes up, with no gap and no overlap. Most melodies are played legato. A curved line over the notes (a slur) asks for it.' },
      { t: 'p', x: 'Staccato means short and detached, shown by a dot above or below the note. Bounce off the key from the wrist, as if it were hot.' },
      { t: 'play', id: 'bp-touch-1', title: 'Legato, then staccato', spec: { clef: 'treble', time: '4/4', music: 'S( c4:q d4 e4 f4 | g4:w S) | g4:q^st f4^st e4^st d4^st | c4:w FIN' }, bpm: 72 },
      { t: 'tip', x: 'You can’t feel the difference on a screen, but on a real piano or MIDI keyboard you can. Listen for gaps in your legato.' }
    ] } },
  { before: 'b6-rh', lesson: {
    id: 'bp-practise', title: 'How to practise a piece', mins: 8,
    goal: 'Use a simple routine that learns any piece faster.',
    blocks: [
      { t: 'p', x: 'Most people practise by playing a piece from the start again and again, stopping at the same mistakes each time. That’s slow. Here’s a better routine.' },
      { t: 'steps', x: ['Look first: the key signature, time signature, highest and lowest notes, and any repeats.', 'Clap or tap the rhythm while counting.', 'Play hands separately, a few bars at a time.', 'Join the hands slowly, at a speed where you make no mistakes.', 'Practise the hard bars on their own, then with the bar before and after.', 'Finish by playing the whole piece without stopping, even if it isn’t perfect.'] },
      { t: 'p', x: 'The Pieces tab has tools for each of these steps: Right and Left to practise one hand while the app plays the other, a tempo control to slow down, and Bars with Loop to repeat just the hard part.' },
      { t: 'tip', x: 'Short, focused practice beats long, tired practice. Fifteen minutes every day is worth more than two hours on a Sunday.' }
    ] } },
  { after: 'b6-turns', lesson: {
    id: 'bp-chords', title: 'Your first chords: C, F and G', mins: 10,
    goal: 'Play three left-hand chords and move between them without looking.',
    blocks: [
      { t: 'p', x: 'A chord is three or more notes played together. With just three chords, C, F and G, you can accompany hundreds of songs.' },
      { t: 'p', x: 'Put your left hand in C position and play fingers 5, 3 and 1 together: C, E and G. That’s a C chord.' },
      { t: 'keys', title: 'C chord: fingers 5 3 1', from: 36, to: 60, labels: 'c', fingers: { c3: 5, e3: 3, g3: 1 } },
      { t: 'p', x: 'For F, keep the little finger on C and move finger 2 to F and the thumb to A. For G, move the little finger down to B and finger 2 to F, keeping the thumb on G. The hand hardly moves at all.' },
      { t: 'keys', title: 'F chord (C at the bottom): 5 2 1', from: 36, to: 60, labels: 'c', fingers: { c3: 5, f3: 2, a3: 1 } },
      { t: 'keys', title: 'G7 chord (B at the bottom): 5 2 1', from: 36, to: 60, labels: 'c', fingers: { b2: 5, f3: 2, g3: 1 } },
      { t: 'play', id: 'bp-chords-lh', title: 'C, F, C, G7, C', spec: { clef: 'bass', time: '4/4', music: '(c3 e3 g3):w | (c3 f3 a3):w | (c3 e3 g3):w | (b2 f3 g3):w | (c3 e3 g3):w FIN' }, bpm: 60 },
      { t: 'play', id: 'bp-chords-tune', title: 'Chords under a tune', spec: { clef: 'grand', time: '4/4', rh: 'e4:q d4 c4 d4 | e4 f4 a4:h | g4:q e4 d4 f4 | e4 d4 c4:h FIN', lh: '(c3 e3 g3):w | (c3 f3 a3):w | (b2 f3 g3):w | (c3 e3 g3):w FIN' }, bpm: 66 },
      { t: 'piece', id: 'p-chord-walk' }
    ] } },
  { after: 'bp-chords', lesson: {
    id: 'bp-positions', title: 'Moving your hand to new positions', mins: 8,
    goal: 'Shift to G position and back, and keep reading while you move.',
    blocks: [
      { t: 'p', x: 'Five fingers only cover five notes, so music often moves your hand. In G position the right thumb goes on G4, with one finger on each key up to D5.' },
      { t: 'keys', title: 'Right hand in G position', from: 53, to: 76, labels: 'c', fingers: { g4: 1, a4: 2, b4: 3, c5: 4, d5: 5 } },
      { t: 'play', id: 'bp-pos-g', title: 'In G position', spec: { clef: 'treble', time: '4/4', music: 'g4:q@1 a4 b4 c5 | d5:h@5 b4:h@3 | c5:q@4 b4 a4 c5 | g4:w@1 FIN' }, bpm: 72 },
      { t: 'p', x: 'Before a move, look for the first note of the new position and the finger number written on it. Move during a rest or a long note.' },
      { t: 'play', id: 'bp-pos-shift', title: 'From C position to G position and back', spec: { clef: 'treble', time: '4/4', music: 'c4:q@1 d4 e4 f4 | g4:h@5 r:h | g4:q@1 a4 b4 c5 | d5:h@5 r:h | c4:q@1 e4 g4@5 e4 | c4:w@1 FIN' }, bpm: 72 },
      { t: 'tip', x: 'Practise the shift itself: the last note of the old position and the first of the new, back and forth, until the jump is automatic.' },
      { t: 'piece', id: 'p-g-position' }
    ] } },

  /* ---------------- Intermediate ---------------- */
  { after: 'i1-accidentals', lesson: {
    id: 'ip-black-keys', title: 'Playing the black keys', mins: 8,
    goal: 'Reach the black keys comfortably and use the right fingers on them.',
    blocks: [
      { t: 'p', x: 'Black keys are narrower and further back. When a passage uses them, move your whole hand a little further in towards the back of the keys, rather than reaching with straight fingers.' },
      { t: 'list', x: ['The long fingers (2, 3 and 4) are best on black keys.', 'Avoid putting the thumb on a black key when you can: it pulls the hand out of shape.', 'Keep the fingers curved even though the key is higher.'] },
      { t: 'p', x: 'The chromatic scale goes up every key, black and white. Its fingering is simple: 3 on every black key, 1 on most white keys, and 2 where two white keys sit side by side (E to F, and B to C).' },
      { t: 'play', id: 'ip-chromatic', title: 'Chromatic scale, right hand', spec: { clef: 'treble', time: '4/4', music: 'c4:8@1 c#4@3 d4@1 d#4@3 e4@1 f4@2 f#4@3 g4@1 | g#4@3 a4@1 a#4@3 b4@1 c5:h@2 | c5:8@2 b4@1 bb4@3 a4@1 ab4@3 g4@1 gb4@3 f4@2 | e4@1 eb4@3 d4@1 db4@3 c4:h@1 FIN' }, bpm: 60 },
      { t: 'tip', x: 'Notice that the music uses sharps going up and flats coming down. Same keys, different names: you met this as enharmonic notes.' }
    ] } },
  { after: 'i2-what', lesson: {
    id: 'ip-scale-c', title: 'Your first scale: C major', mins: 12,
    goal: 'Play C major in each hand, passing the thumb under smoothly.',
    blocks: [
      { t: 'p', x: 'A scale is every note of a key in order. Scales train your fingers, and because pieces are built from scales and chords, every scale you learn makes reading easier too.' },
      { t: 'p', x: 'Eight notes and five fingers means the hand has to move without a break. Right hand: 1 2 3, tuck the thumb under to F, then 1 2 3 4 5. Coming down: 5 4 3 2 1, then cross finger 3 over the thumb to E.' },
      { t: 'keys', title: 'Right hand fingering', from: 48, to: 74, labels: 'c', fingers: { c4: 1, d4: 2, e4: 3, f4: 1, g4: 2, a4: 3, b4: 4, c5: 5 } },
      { t: 'play', id: 'ip-cscale-rh', title: 'C major, right hand', spec: TX('major', 'C', 'rh'), bpm: 72 },
      { t: 'p', x: 'Left hand going up: 5 4 3 2 1, then cross finger 3 over the thumb to A, then 2 1. Coming down, tuck the thumb under after G.' },
      { t: 'keys', title: 'Left hand fingering', from: 36, to: 62, labels: 'c', fingers: { c3: 5, d3: 4, e3: 3, f3: 2, g3: 1, a3: 3, b3: 2, c4: 1 } },
      { t: 'play', id: 'ip-cscale-lh', title: 'C major, left hand', spec: TX('major', 'C', 'lh'), bpm: 72 },
      { t: 'tip', x: 'Start moving the thumb under early, while finger 3 is still playing, so there’s no bump in the sound. Practise just the crossing on its own: E–F–E–F with fingers 3 and 1.' },
      { t: 'p', x: 'When both hands are smooth, try hands together in Practise, under Scales and chords.' }
    ] } },
  { after: 'i2-flats', lesson: {
    id: 'ip-scales-more', title: 'G, D and F major scales', mins: 12,
    goal: 'Play three more major scales with the right fingering.',
    blocks: [
      { t: 'p', x: 'G and D major use exactly the same fingering as C. Only the black keys change: F♯ in G major, F♯ and C♯ in D major.' },
      { t: 'play', id: 'ip-gscale-rh', title: 'G major, right hand', spec: TX('major', 'G', 'rh'), bpm: 72 },
      { t: 'play', id: 'ip-dscale-rh', title: 'D major, right hand', spec: TX('major', 'D', 'rh'), bpm: 72 },
      { t: 'p', x: 'F major is different in the right hand, because the thumb mustn’t land on B♭. Play 1 2 3 4 (F G A B♭), then the thumb goes under to C, then 1 2 3 4.' },
      { t: 'play', id: 'ip-fscale-rh', title: 'F major, right hand', spec: TX('major', 'F', 'rh'), bpm: 72 },
      { t: 'table', head: ['Scale', 'Right hand going up', 'Left hand going up'], rows: [['C, G, D, A, E', '1 2 3 1 2 3 4 5', '5 4 3 2 1 3 2 1'], ['F', '1 2 3 4 1 2 3 4', '5 4 3 2 1 3 2 1']] },
      { t: 'tip', x: 'All twelve major keys are in Practise, under Scales and chords, with the fingering on every note.' }
    ] } },
  { after: 'i4-chords', lesson: {
    id: 'ip-inversions', title: 'Chord inversions', mins: 10,
    goal: 'Play a chord in three positions and use inversions to move smoothly between chords.',
    blocks: [
      { t: 'p', x: 'The same three notes can be stacked in different orders. With C at the bottom, a C chord is in root position. Move the C to the top and you get first inversion (E G C). Move the E up as well and it’s second inversion (G C E). It’s still a C chord.' },
      { t: 'play', id: 'ip-inv-c', title: 'C major and its inversions', spec: TX('inv', 'C', 'rh'), bpm: 60 },
      { t: 'p', x: 'Why bother? Inversions let you move between chords with tiny movements. From C to F in root position every finger jumps. From C to F with C at the bottom (C F A), only two fingers move.' },
      { t: 'play', id: 'ip-inv-move', title: 'C, F, G7, C with smooth voicings', spec: { clef: 'treble', time: '4/4', music: '(c4 e4 g4):w | (c4 f4 a4):w | (b3 f4 g4):w | (c4 e4 g4):w FIN' }, bpm: 60 },
      { t: 'tip', x: 'Look for notes two chords share and keep them held down. That’s how pianists make chord changes sound smooth.' }
    ] } },
  { after: 'ip-inversions', lesson: {
    id: 'ip-arpeggios', title: 'Broken chords and arpeggios', mins: 10,
    goal: 'Play chords one note at a time, smoothly and evenly.',
    blocks: [
      { t: 'p', x: 'Many accompaniments spread a chord out. A broken chord plays its notes one after another within the hand. An arpeggio carries on up or down into the next octave.' },
      { t: 'play', id: 'ip-broken', title: 'Broken chords: C, F, G7, C', spec: { clef: 'treble', time: '4/4', music: 'c4:8@1 e4@3 g4@5 e4@3 c4@1 e4 g4 e4 | c4@1 f4@3 a4@5 f4 c4 f4 a4 f4 | b3@1 f4@4 g4@5 f4 b3 f4 g4 f4 | c4:w@1 FIN' }, bpm: 66 },
      { t: 'play', id: 'ip-arp-c-rh', title: 'C major arpeggio, right hand', spec: TX('arp', 'C', 'rh'), bpm: 66 },
      { t: 'play', id: 'ip-arp-c-lh', title: 'C major arpeggio, left hand', spec: TX('arp', 'C', 'lh'), bpm: 66 },
      { t: 'tip', x: 'Let the wrist move sideways a little as the hand opens and closes. If you hold it rigid, wide arpeggios feel stiff.' }
    ] } },
  { after: 'i4-fingering', lesson: {
    id: 'ip-lead-sheets', title: 'Playing from chord symbols', mins: 12,
    goal: 'Read a lead sheet: play the tune and make up your own left hand.',
    blocks: [
      { t: 'p', x: 'Pop, jazz and folk songbooks often give just the tune, with chord names above it. This is called a lead sheet. You decide how to play the chords.' },
      { t: 'table', head: ['Symbol', 'Means', 'Notes'], rows: [['C', 'C major', 'C E G'], ['Cm', 'C minor', 'C E♭ G'], ['C7', 'C seventh', 'C E G B♭'], ['Cmaj7', 'C major seventh', 'C E G B'], ['Cm7', 'C minor seventh', 'C E♭ G B♭'], ['C/E', 'C chord with E in the bass', 'E in the left hand, C chord above']] },
      { t: 'p', x: 'Start simply: hold the chord’s root (its letter name) in the left hand while the right hand plays the tune. Here the left hand is written in for you.' },
      { t: 'play', id: 'ip-lead-roots', title: 'Tune with chord roots', spec: { clef: 'grand', time: '4/4', rh: 'e4:q[C] e4 f4 g4 | g4[G] f4 e4 d4 | c4[Am] c4 d4 e4 | e4:q.[F] d4:8 d4:h[G] | e4:q[C] e4 f4 g4 | g4[G] f4 e4 d4 | c4[Am] c4 d4[G] e4 | d4:q.[G] c4:8 c4:h[C] FIN', lh: 'c3:w | g2:w | a2:w | f2:h g2 | c3:w | g2:w | a2:h g2 | g2:h c3 FIN' }, bpm: 76 },
      { t: 'p', x: 'Now read only the chord symbols and play the full chords from earlier lessons in your left hand. Listen to the tune first if you need to.' },
      { t: 'score', title: 'A lead sheet: your left hand, your choice', spec: { clef: 'treble', time: '4/4', music: 'e4:q[C] e4 f4 g4 | g4[G] f4 e4 d4 | c4[Am] c4 d4 e4 | e4:q.[F] d4:8 d4:h[G] | e4:q[C] e4 f4 g4 | g4[G] f4 e4 d4 | c4[Am] c4 d4[G] e4 | d4:q.[G] c4:8 c4:h[C] FIN' }, bpm: 76 },
      { t: 'tip', x: 'A chord symbol sits above the beat where the chord changes, and lasts until the next symbol.' }
    ] } },
  { after: 'i5-dynamics', lesson: {
    id: 'ip-touch', title: 'Loud and soft: controlling your touch', mins: 8,
    goal: 'Play louder and softer on purpose, and make a tune stand out over its accompaniment.',
    blocks: [
      { t: 'p', x: 'On a piano, volume comes from speed: the faster the key goes down, the louder the note. Loud doesn’t mean hitting. It means letting more weight from the arm drop quickly into the key.' },
      { t: 'list', x: ['pp and p: fingers close to the keys, gentle.', 'mf: normal arm weight.', 'f and ff: more weight from the arm and shoulder, still relaxed.', 'Crescendo: a little more weight on each note.'] },
      { t: 'p', x: 'The most important skill is balance: the tune louder than the accompaniment. Your right hand sings; your left hand murmurs underneath.' },
      { t: 'score', title: 'Tune (mf) over a quiet left hand (p)', spec: { clef: 'grand', time: '4/4', rh: 'e4:q{mf} g4 c5 b4 | a4:h g4 | f4:q a4 g4 e4 | d4:w FIN', lh: 'c3:8{p} g3 e3 g3 c3 g3 e3 g3 | f2 c3 a2 c3 c3 g3 e3 g3 | d3 a3 f3 a3 c3 g3 e3 g3 | g2 d3 b2 d3 g2 d3 b2 d3 FIN' }, bpm: 72 },
      { t: 'tip', x: 'With a MIDI keyboard, the app’s piano sound follows how hard you play, so you can hear your own balance.' }
    ] } },
  { after: 'i5-pedal', lesson: {
    id: 'ip-pedal', title: 'Using the sustain pedal', mins: 10,
    goal: 'Change the pedal cleanly so chords join without blurring.',
    blocks: [
      { t: 'p', x: 'The right-hand pedal (the sustain pedal) keeps notes ringing after you lift your fingers. Used well, it joins chords smoothly. Used badly, everything blurs together.' },
      { t: 'steps', x: ['Play the first chord, then press the pedal down just after it.', 'Play the next chord. As it sounds, lift the pedal and press it straight down again.', 'Keep going: hands first, pedal up and down just after. The new chord is caught and the old one cleared.'] },
      { t: 'p', x: 'This is called legato pedalling. The foot always moves just after the hands, never at the same moment.' },
      { t: 'score', title: 'Change the pedal on every chord', spec: { clef: 'treble', time: '4/4', music: 'P( (c4 e4 g4):w P) | P( (c4 f4 a4):w P) | P( (b3 f4 g4):w P) | P( (c4 e4 g4):w P) FIN' }, bpm: 60 },
      { t: 'list', x: ['Keep your heel on the floor and press with the ball of the foot.', 'Change the pedal whenever the chord changes.', 'If it sounds muddy, you changed too late or not at all.'] },
      { t: 'tip', x: 'A sustain pedal plugged into a MIDI keyboard works with the app: the sound holds while the pedal is down.' },
      { t: 'piece', id: 'p-snowfall' }
    ] } },
  { after: 'ip-pedal', lesson: {
    id: 'ip-accomp', title: 'Left-hand patterns', mins: 12,
    goal: 'Play the five most common left-hand accompaniment patterns.',
    blocks: [
      { t: 'p', x: 'Once you know a song’s chords, the left hand can play them in many ways. These five patterns cover most of the music you’ll meet. Each uses the same chords: C, F, G7, C.' },
      { t: 'play', id: 'ip-acc-block', title: 'Repeated chords', spec: { clef: 'bass', time: '4/4', music: '(c3 e3 g3):h (c3 e3 g3) | (c3 f3 a3):h (c3 f3 a3) | (b2 f3 g3):h (b2 f3 g3) | (c3 e3 g3):w FIN' }, bpm: 72 },
      { t: 'play', id: 'ip-acc-broken', title: 'Broken chords', spec: { clef: 'bass', time: '4/4', music: 'c3:8 e3 g3 e3 c3 e3 g3 e3 | c3 f3 a3 f3 c3 f3 a3 f3 | b2 f3 g3 f3 b2 f3 g3 f3 | c3:w FIN' }, bpm: 72 },
      { t: 'play', id: 'ip-acc-alberti', title: 'Alberti bass: low, high, middle, high', spec: { clef: 'bass', time: '4/4', music: 'c3:8 g3 e3 g3 c3 g3 e3 g3 | c3 a3 f3 a3 c3 a3 f3 a3 | b2 g3 f3 g3 b2 g3 f3 g3 | c3:w FIN' }, bpm: 72 },
      { t: 'play', id: 'ip-acc-waltz', title: 'Waltz: bass note, then two chords', spec: { clef: 'bass', time: '3/4', music: 'c3:q (e3 g3) (e3 g3) | f2 (a2 c3) (a2 c3) | g2 (b2 f3) (b2 f3) | c3:h. FIN' }, bpm: 96 },
      { t: 'play', id: 'ip-acc-pop', title: 'Pop: root, fifth, octave', spec: { clef: 'bass', time: '4/4', music: 'c3:q g3 c4 g3 | f2 c3 f3 c3 | g2 d3 g3 d3 | c3:w FIN' }, bpm: 84 },
      { t: 'tip', x: 'Changing the left-hand pattern is the quickest way to make a tune sound like a different style. Try each one under the lead sheet from the chord symbols lesson.' },
      { t: 'piece', id: 'p-alberti' }
    ] } },
  { newUnit: { level: 'intermediate', after: 'i5', id: 'i6', title: 'Learning pieces well' }, lesson: {
    id: 'ip-new-piece', title: 'Learning a new piece, step by step', mins: 10,
    goal: 'Take a piece from first look to playing it all the way through.',
    blocks: [
      { t: 'p', x: 'You now have the skills. This is a method for learning any new piece, whether it’s from a book or from this app.' },
      { t: 'steps', x: ['Scan it: title, key, time signature, speed marking, repeats and any tricky-looking bars.', 'Find the sections. Most pieces repeat ideas, and spotting them halves the work.', 'Work out fingering for awkward bits before you start, not after you’ve learned them wrong.', 'Learn it in sections of two to four bars: hands separately, then together.', 'Use a slow, steady speed with the metronome, around half the final speed.', 'Join the sections, overlapping each one by a bar.', 'Speed up in small steps, four to eight beats per minute at a time.'] },
      { t: 'tip', x: 'In the Pieces tab: start in Wait for me with one hand, then both. Slow the tempo down, loop the hard bars, and finish with Play in time, which scores your timing as well as your notes. Full screen makes it easier to read ahead.' },
      { t: 'checklist', key: 'ip-new-piece', items: ['Chose a new piece', 'Learned it in sections', 'Played it through without stopping'] }
    ] } },
  { after: 'ip-new-piece', lesson: {
    id: 'ip-hard-bits', title: 'Fixing the hard bits', mins: 8,
    goal: 'Turn a passage you keep getting wrong into one you can’t get wrong.',
    blocks: [
      { t: 'steps', x: ['Find exactly where it goes wrong. Usually it’s one shift of the hand or one fingering.', 'Practise just that spot: the note before, the problem, and the note after.', 'Play it slowly enough to get it right five times in a row.', 'Change the rhythm: play it long-short, then short-long. This makes even passages solid.', 'Test it without looking at your hands.', 'Put it back in place: two bars before, two bars after.'] },
      { t: 'p', x: 'Mistakes you repeat become habits. If you make the same mistake twice, stop and fix it before carrying on.' },
      { t: 'tip', x: 'Start each practice session with the hardest part, while you’re fresh. In the Pieces tab, choose just those bars and turn on Loop.' }
    ] } },

  /* ---------------- Advanced ---------------- */
  { after: 'a1-circle', lesson: {
    id: 'ap-all-scales', title: 'Scales in every key', mins: 12,
    goal: 'Know the fingering rules that work in all twelve major keys.',
    blocks: [
      { t: 'p', x: 'You don’t need to memorise twelve different fingerings. A few rules cover all of them.' },
      { t: 'list', x: ['The thumb never plays a black key in a scale.', 'Fingers make two groups, 1 2 3 and 1 2 3 4, and the thumb comes straight after the black keys.', 'The fourth finger plays once per octave. In flat keys the right hand’s 4th finger lands on B♭.', 'In keys with many black keys, the groups of two and three black keys line up with fingers 2 3 and 2 3 4.'] },
      { t: 'table', head: ['Key', 'Right hand going up', 'Left hand going up'], rows: Object.entries(SCALE_FINGERS.major).map(([k, [r, l]]) => [keyName(k).replace(' major', ''), r.split('').join(' '), l.split('').join(' ')]) },
      { t: 'play', id: 'ap-eb-rh', title: 'E♭ major, right hand', spec: TX('major', 'Eb', 'rh'), bpm: 72 },
      { t: 'play', id: 'ap-b-lh', title: 'B major, left hand', spec: TX('major', 'B', 'lh'), bpm: 72 },
      { t: 'tip', x: 'For speed and evenness, practise scales in rhythms: long-short, short-long, then in groups of three. Then play them straight. Every key is in Practise, under Scales and chords.' }
    ] } },
  { after: 'a1-minor', lesson: {
    id: 'ap-minor-scales', title: 'Minor scales', mins: 10,
    goal: 'Play natural, harmonic and melodic minor scales.',
    blocks: [
      { t: 'p', x: 'Every major key has a relative minor that shares its key signature. A minor uses the notes of C major, starting on A. That’s the natural minor.' },
      { t: 'p', x: 'The harmonic minor raises the 7th note by a semitone (G♯ in A minor), giving a classical, slightly exotic sound. It’s the one exams ask for most. The melodic minor raises the 6th and 7th going up, then comes down as the natural minor.' },
      { t: 'score', title: 'A minor: natural, harmonic, melodic going up, melodic coming down', spec: { clef: 'treble', time: '4/4', music: 'a4:8 b4 c5 d5 e5 f5 g5 a5 | a4 b4 c5 d5 e5 f5 g#5 a5 | a4 b4 c5 d5 e5 f#5 g#5 a5 | a5 g5 f5 e5 d5 c5 b4 a4 FIN' }, bpm: 72 },
      { t: 'play', id: 'ap-am-rh', title: 'A harmonic minor, right hand', spec: TX('minor', 'A', 'rh'), bpm: 72 },
      { t: 'play', id: 'ap-am-lh', title: 'A harmonic minor, left hand', spec: TX('minor', 'A', 'lh'), bpm: 72 },
      { t: 'tip', x: 'A, E, D, G and C minor use the same fingering as C major. The others are in Practise, under Scales and chords.' }
    ] } },
  { after: 'a2-triplets', lesson: {
    id: 'ap-independence', title: 'Hand independence', mins: 12,
    goal: 'Let each hand do something different without one copying the other.',
    blocks: [
      { t: 'p', x: 'Harder music asks each hand to have its own personality: different rhythms, different touches, different volumes.' },
      { t: 'play', id: 'ap-ind-touch', title: 'Left hand smooth, right hand short', spec: { clef: 'grand', time: '4/4', rh: 'c5:q^st e5^st g5^st e5^st | d5^st f5^st b4:h | c5:q^st e5^st g5^st e5^st | c5:w FIN', lh: 'S( c3:h e3 | g2:h b2 | c3:h e3 | c3:w S) FIN' }, bpm: 76 },
      { t: 'p', x: 'Next, keep the left hand perfectly steady while the right hand plays off the beat. Count the quavers: 1 and 2 and.' },
      { t: 'play', id: 'ap-ind-offbeat', title: 'Steady left, off-beat right', spec: { clef: 'grand', time: '4/4', rh: 'r:8 e5 r:8 e5 r:8 g5 r:8 g5 | r:8 f5 r:8 f5 r:8 d5 r:8 d5 | r:8 e5 r:8 g5 r:8 c5 r:8 e5 | c5:w FIN', lh: 'c3:q g2 c3 g2 | g2 d3 g2 d3 | c3 g2 c3 g2 | c3:w FIN' }, bpm: 72 },
      { t: 'p', x: 'Finally, two against three: the left hand plays two even notes while the right hand plays a triplet. Say “nice cup of tea”: nice (both hands), cup (right), of (left), tea (right).' },
      { t: 'play', id: 'ap-ind-23', title: 'Two against three', spec: { clef: 'grand', time: '4/4', rh: 'c5:8t e5:8t g5:8t c5:8t e5:8t g5:8t c5:8t e5:8t g5:8t c5:8t e5:8t g5:8t | c5:w FIN', lh: 'c3:8 g3 c3 g3 c3 g3 c3 g3 | c3:w FIN' }, bpm: 50 },
      { t: 'tip', x: 'Tap two against three on a table first: left hand on your knee, right hand on the table.' }
    ] } },
  { after: 'a2-offbeat', lesson: {
    id: 'ap-swing', title: 'Swing and groove', mins: 10,
    goal: 'Play swung quavers and hear the difference between straight and swing.',
    blocks: [
      { t: 'p', x: 'In jazz, blues and lots of pop, pairs of quavers aren’t played evenly. The first is longer and the second shorter: long-short, long-short. This is swing. It’s usually written as ordinary quavers with the word Swing at the top.' },
      { t: 'score', title: 'Played straight', spec: { clef: 'treble', time: '4/4', music: 'c5:8 d5 e5 g5 a5 g5 e5 d5 | c5 e5 g5 e5 c5:h FIN' }, bpm: 100 },
      { t: 'score', title: 'The same notes, swung', swing: true, spec: { clef: 'treble', time: '4/4', music: 'c5:8 d5 e5 g5 a5 g5 e5 d5 | c5 e5 g5 e5 c5:h FIN' }, bpm: 100 },
      { t: 'play', id: 'ap-swing-riff', title: 'A swung blues riff with walking bass', swing: true, spec: { clef: 'grand', time: '4/4', rh: 'g4:8 bb4 c5 eb5 e5:q c5 | g4:8 bb4 c5 eb5 e5:h | a4:8 c5 eb5 f5 eb5:q c5 | g4:8 bb4 c5 eb5 c5:h FIN', lh: 'c3:q e3 g3 a3 | bb3 a3 g3 e3 | f2 a2 c3 d3 | c3 g2 c3:h FIN' }, bpm: 96 },
      { t: 'tip', x: 'Swing the quavers, not the crotchets. And lean a little on beats 2 and 4 rather than 1 and 3.' },
      { t: 'piece', id: 'p-boogie' }
    ] } },
  { after: 'a3-far-ledger', lesson: {
    id: 'ap-octaves', title: 'Octaves and big chords', mins: 8,
    goal: 'Play octaves and wide chords without strain.',
    blocks: [
      { t: 'p', x: 'Octaves are played with the thumb and little finger (1 and 5), or 1 and 4 on black keys if your hand is big enough. The hand keeps its shape and the wrist does the moving.' },
      { t: 'list', x: ['Keep the hand shape fixed, but not locked.', 'Bounce from the wrist for repeated octaves.', 'Relax between notes. Tension is what makes octaves tiring.', 'If you can’t reach an octave yet, play the top note only and add the bottom note later.'] },
      { t: 'play', id: 'ap-oct-rh', title: 'Octaves up and down, right hand', spec: { clef: 'treble', time: '4/4', music: '(c4 c5):q (d4 d5) (e4 e5) (f4 f5) | (g4 g5):w | (g4 g5):q (f4 f5) (e4 e5) (d4 d5) | (c4 c5):w FIN' }, bpm: 60 },
      { t: 'p', x: 'Chords wider than your hand are rolled: spread quickly from the bottom note up, holding each note as you go. Music shows this with a wavy line beside the chord.' },
      { t: 'piece', id: 'p-credits' }
    ] } },
  { after: 'a3-clef-change', lesson: {
    id: 'ap-sevenths', title: 'Seventh chords and voicings', mins: 12,
    goal: 'Build major 7th, dominant 7th and minor 7th chords, and voice them as pianists do.',
    blocks: [
      { t: 'p', x: 'Add one more note, a third above the top of a triad, and you get a seventh chord. Three types cover most of pop and jazz.' },
      { t: 'table', head: ['Chord', 'Built from', 'On C'], rows: [['Major 7th (Cmaj7)', 'root, major 3rd, 5th, major 7th', 'C E G B'], ['Dominant 7th (C7)', 'root, major 3rd, 5th, minor 7th', 'C E G B♭'], ['Minor 7th (Cm7)', 'root, minor 3rd, 5th, minor 7th', 'C E♭ G B♭']] },
      { t: 'score', title: 'Cmaj7, C7, Cm7', spec: { clef: 'treble', time: '4/4', music: '(c4 e4 g4 b4):w[Cmaj7] | (c4 e4 g4 bb4):w[C7] | (c4 eb4 g4 bb4):w[Cm7] FIN' }, bpm: 60 },
      { t: 'p', x: 'Four notes in one hand can sound thick low down. Pianists split them: the left hand plays a shell (root and 7th), and the right hand plays the 3rd and 5th, or the tune.' },
      { t: 'play', id: 'ap-two-five-one', title: 'ii–V–I in C with shell voicings', spec: { clef: 'grand', time: '4/4', rh: '(f4 a4):w[Dm7] | (f4 b4):w[G7] | (e4 g4):w[Cmaj7] FIN', lh: '(d3 c4):w | (g2 f3):w | (c3 b3):w FIN' }, bpm: 60 },
      { t: 'tip', x: 'The ii–V–I (two-five-one) is the most common progression in jazz. Learn it in a few keys and you’ll recognise it everywhere.' },
      { t: 'piece', id: 'p-two-five' }
    ] } },
  { after: 'a4-ahead', lesson: {
    id: 'ap-sightread-play', title: 'Sight-reading at the keyboard', mins: 10,
    goal: 'Play a new piece first time through without stopping.',
    blocks: [
      { t: 'p', x: 'Sight-reading isn’t about getting every note right. It’s about keeping the beat going and getting the important things: the tune, the bass and the rhythm.' },
      { t: 'steps', x: ['Take thirty seconds to scan: key, time, hand positions and patterns.', 'Choose a slow speed you can keep the whole way through.', 'Keep your eyes on the music, not your hands. Find your way by feeling the black keys.', 'Read ahead: while you play one beat, look at the next.', 'If you miss something, leave it out. Never stop and go back.', 'Simplify as you go: drop the middle notes of chords, or play just the bass note.'] },
      { t: 'play', id: 'ap-sight-test', title: 'Sight-reading test: play it once, without stopping', hint: false, spec: { clef: 'grand', key: 'F', time: '4/4', rh: 'c5:q a4 f4 a4 | bb4:h g4 | a4:q c5 f5 e5 | d5:h c5 | bb4:q d5 c5 bb4 | a4 g4 f4 a4 | g4 e4 c4 e4 | f4:w FIN', lh: 'f3:h c3 | g3:h c3 | f3:h a3 | bb3:h a3 | g3:h bb3 | f3:h d3 | c3:h c3 | f2:w FIN' }, bpm: 66 },
      { t: 'tip', x: 'Sight-read something new every day, a little easier than the pieces you’re learning. Hymn books and easy graded collections are ideal.' }
    ] } },
  { newUnit: { level: 'advanced', after: 'a4', id: 'a5', title: 'Musicianship' }, lesson: {
    id: 'ap-blues-impro', title: 'Improvising with the blues scale', mins: 12,
    goal: 'Make up your own solo over a twelve-bar blues.',
    blocks: [
      { t: 'p', x: 'Improvising means making the music up as you go. The blues scale is the easiest place to start, because almost any note in it sounds good over a blues.' },
      { t: 'p', x: 'The C blues scale is C, E♭, F, F♯, G, B♭, C. The F♯ is the “blue note”: use it in passing, on the way to F or G.' },
      { t: 'keys', title: 'C blues scale', from: 55, to: 76, labels: 'c', mark: ['c4', 'eb4', 'f4', 'f#4', 'g4', 'bb4', 'c5'] },
      { t: 'play', id: 'ap-blues-scale', title: 'C blues scale, up and down', spec: { clef: 'treble', time: '4/4', music: 'c4:8 eb4 f4 f#4 g4 bb4 c5:q | c5:8 bb4 g4 f#4 f4 eb4 c4:q FIN' }, bpm: 80 },
      { t: 'steps', x: ['Play the left hand of a twelve-bar blues (the pieces below have one), or record yourself playing it.', 'With the right hand, use just three notes: C, E♭ and G. Make short phrases with gaps between them.', 'Repeat an idea, then change one note. Repetition makes it sound intentional.', 'Add F and B♭, then the blue note F♯.', 'Leave space. Rests are part of a solo.'] },
      { t: 'piece', id: 'p-blues-c' },
      { t: 'tip', x: 'Copy first: learn the right-hand licks in the blues pieces, then change them a little. That’s how most players learn to improvise.' }
    ] } },
  { after: 'ap-blues-impro', lesson: {
    id: 'ap-pentatonic', title: 'Improvising over pop chords', mins: 10,
    goal: 'Use the pentatonic scale to make up tunes over any pop chord loop.',
    blocks: [
      { t: 'p', x: 'The major pentatonic scale is a major scale without its 4th and 7th notes: in C, that’s C D E G A. With no awkward notes, it fits over the C, G, Am and F chords of countless pop songs.' },
      { t: 'keys', title: 'C major pentatonic', from: 55, to: 76, labels: 'c', mark: ['c4', 'd4', 'e4', 'g4', 'a4', 'c5'] },
      { t: 'play', id: 'ap-penta-tune', title: 'A pentatonic tune over C, G, Am, F', spec: { clef: 'grand', time: '4/4', rh: 'e4:q[C] g4 a4 g4 | d4:h[G] e4 | c4:q[Am] d4 e4 a4 | g4:w[F] FIN', lh: '(c3 g3):w | (g2 d3):w | (a2 e3):w | (f2 c3):w FIN' }, bpm: 80 },
      { t: 'steps', x: ['Play the four chords in your left hand, one bar each, round and round.', 'Make up a right-hand tune using only C D E G A.', 'End phrases on C or E for a settled sound, or on D or A to keep it open.', 'Borrow rhythms from songs you know.'] },
      { t: 'tip', x: 'This is also a way to write songs: find a chord loop you like and play pentatonic phrases over it until one sticks.' }
    ] } },
  { after: 'ap-pentatonic', lesson: {
    id: 'ap-by-ear', title: 'Playing by ear', mins: 10,
    goal: 'Work out a simple tune and its chords without the music.',
    blocks: [
      { t: 'steps', x: ['Sing or hum the tune and find its last note on the piano. That’s very often the key note.', 'Find the first note by trial and error, then the next: higher or lower? A step or a leap?', 'Write down the letter names as you go.', 'For chords, try the three main chords of the key under each part of the tune (C, F and G in C major). Let your ear choose.', 'If none fit, try the chord built on the 6th note (A minor in C major).'] },
      { t: 'p', x: 'It’s slow at first. The interval quiz in Practise trains the same skill: hearing how far apart two notes are. Try working out Happy Birthday starting on G, then check your answer here.' },
      { t: 'play', id: 'ap-ear-birthday', title: 'Check your answer: Happy Birthday in C', hint: false, spec: { clef: 'grand', time: '3/4', rh: 'g4:8. g4:16 | a4:q g4 c5 | b4:h g4:8. g4:16 | a4:q g4 d5 | c5:h g4:8. g4:16 | g5:q e5 c5 | b4 a4 f5:8. f5:16 | e5:q c5 d5 | c5:h FIN', lh: 'r:q | c3:h. | g2:h. | g2:h. | c3:h. | c3:h. | f2:h. | c3:q c3 g2 | c3:h FIN' }, bpm: 90 },
      { t: 'tip', x: 'Pick tunes you know well: nursery rhymes, carols, themes from films. Knowing exactly how it should sound is half the work.' }
    ] } },
  { after: 'ap-by-ear', lesson: {
    id: 'ap-memorise', title: 'Memorising a piece', mins: 8,
    goal: 'Learn a piece by heart in a way that holds up under pressure.',
    blocks: [
      { t: 'p', x: 'Playing from memory frees your eyes to listen. But memory that lives only in your fingers tends to fail when you’re nervous, so build several kinds at once.' },
      { t: 'list', x: ['Finger memory comes from repetition. Useful, but fragile on its own.', 'Sound memory: can you sing the tune and hum the bass line?', 'Visual memory: can you picture the page, or the shapes your hands make?', 'Understanding: know the chords and the structure, such as “verse in C, chorus moves to F, the ending repeats the opening”.'] },
      { t: 'steps', x: ['Memorise in sections, starting from the end, so the ending gets the most practice.', 'Practise starting from any section, not just the beginning.', 'Play each hand separately from memory.', 'Write out the chords from memory.'] },
      { t: 'tip', x: 'If you go blank, jump to the start of the next section you know. Having starting points through the piece is your safety net.' }
    ] } },
  { after: 'ap-memorise', lesson: {
    id: 'ap-perform', title: 'Playing for other people', mins: 8,
    goal: 'Perform a piece confidently, even with nerves.',
    blocks: [
      { t: 'list', x: ['Choose a piece you can play comfortably, a little easier than your hardest.', 'Practise performing at home: one go, no stopping, no second chances. Record yourself.', 'Warm up with a scale first.', 'Before you start, hear the speed of the first two bars in your head.', 'If you slip, keep the beat going. Listeners rarely notice a wrong note, but everyone notices a stop.', 'Nerves are normal. Slow, steady breaths before you start help.'] },
      { t: 'checklist', key: 'ap-perform', items: ['Recorded myself playing a piece', 'Played for one other person', 'Kept going after a mistake'] }
    ] } },
  { after: 'ap-perform', lesson: {
    id: 'ap-next', title: 'Opening a music book: what next', mins: 8,
    goal: 'Choose your next music and set up a practice routine you’ll keep.',
    blocks: [
      { t: 'p', x: 'You can now read both clefs, play hands together, use chords, scales and the pedal, play from chord symbols, and learn a piece on your own. That’s what you need to open a music book and play.' },
      { t: 'h', x: 'Choosing music' },
      { t: 'list', x: ['Graded collections, such as exam board books, give you pieces at the right level, one step at a time.', 'Around grades 1 and 2 suit you after the Intermediate level of this course; grades 3 to 5 after Advanced.', 'Songbooks and fake books with chord symbols let you play pop, jazz and film music from lead sheets.', 'Keep two kinds of music on the go: something a little too hard to learn, and something easy to sight-read.'] },
      { t: 'h', x: 'A balanced 30-minute practice' },
      { t: 'table', head: ['Minutes', 'What'], rows: [['5', 'Scales and arpeggios: add a new key each week'], ['5', 'Sight-reading: something new, played once'], ['15', 'Your current piece, hard bits first'], ['5', 'Something for fun: a piece you know, or improvising']] },
      { t: 'tip', x: 'Taking a graded exam is optional, but it gives you a clear goal and a deadline, which many players find the most useful part.' },
      { t: 'checklist', key: 'ap-next', items: ['Chose a music book', 'Set up a weekly practice routine', 'Learned my first piece from a book'] }
    ] } }
];

/* weave the playing lessons in */
(function weave() {
  const findUnit = id => { for (const lv of LEVELS) for (const u of lv.units) { const k = u.lessons.findIndex(l => l.id === id); if (k >= 0) return [u, k]; } return [null, -1]; };
  PLAY_LESSONS.forEach(entry => {
    const l = Object.assign(entry.lesson, { track: 'play' });
    if (entry.newUnit) {
      const lv = LEVELS.find(x => x.id === entry.newUnit.level);
      const at = lv.units.findIndex(u => u.id === entry.newUnit.after);
      lv.units.splice(at + 1, 0, { id: entry.newUnit.id, title: entry.newUnit.title, lessons: [l] });
      return;
    }
    const [u, k] = findUnit(entry.after || entry.before);
    if (!u) { console.warn('Playing lesson has nowhere to go:', l.id); return; }
    u.lessons.splice(entry.after ? k + 1 : k, 0, l);
  });
})();

const ALL_LESSONS = [];
LEVELS.forEach((lv, li) => lv.units.forEach(u => u.lessons.forEach(l => {
  if (!l.track) l.track = 'read';
  ALL_LESSONS.push(Object.assign(l, { level: lv.id, levelIndex: li, unit: u.title, unitId: u.id }));
})));
const LESSON_BY_ID = Object.fromEntries(ALL_LESSONS.map(l => [l.id, l]));
