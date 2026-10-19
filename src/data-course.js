/* ============================================================
   Course content. Lesson ids are permanent: progress is keyed by them.
   ============================================================ */
const LEVELS = [
  {
    id: 'beginner', name: 'Beginner', tag: 'Start here',
    blurb: 'Sitting well and hand shape, both clefs and the grand stave, five-finger positions, first rhythms, chords and pieces.',
    youCan: 'You have never read music, or only know a few notes.',
    units: [
      {
        id: 'b1', title: 'The keyboard and the stave', lessons: [
          {
            id: 'b1-keyboard', title: 'Finding your way round the keyboard', mins: 8,
            goal: 'Find any white key by looking at the black keys around it.',
            blocks: [
              { t: 'p', x: 'Before reading a single note, you need a map of the piano. The black keys come in groups of two and three, all the way up the keyboard. Those groups are your landmarks.' },
              { t: 'keys', title: 'The groups of two and three', from: 48, to: 71, labels: 'none', mark: ['c#3', 'd#3', 'f#3', 'g#3', 'a#3', 'c#4', 'd#4', 'f#4', 'g#4', 'a#4'] },
              { t: 'steps', x: ['C is the white key just to the left of each group of two black keys.', 'D sits between the two black keys.', 'E is just to the right of the group of two.', 'F is just to the left of each group of three, then G, A and B follow.'] },
              { t: 'keys', title: 'Every C on this stretch of keyboard', from: 48, to: 72, labels: 'all', mark: ['c3', 'c4', 'c5'] },
              { t: 'tip', x: 'Tap any key to hear it. Notes get higher as you move to the right.' }
            ]
          },
          {
            id: 'b1-alphabet', title: 'The musical alphabet and octaves', mins: 6,
            goal: 'Name the seven note letters and know which C is middle C.',
            blocks: [
              { t: 'p', x: 'Music uses only seven letters: A B C D E F G. After G it starts again at A. The distance from one C to the next C is an octave.' },
              { t: 'p', x: 'To tell the Cs apart, each one has a number. Middle C, the C nearest the middle of the piano, is C4. The C an octave above is C5, and the one below is C3.' },
              { t: 'keys', title: 'C3, middle C (C4) and C5', from: 48, to: 72, labels: 'all', mark: ['c3', 'c4', 'c5'] },
              { t: 'tip', x: 'Middle C is usually right in front of the brand name on an acoustic piano, or at the centre of a 61 or 88-key keyboard.' }
            ]
          },
          {
            id: 'b1-stave', title: 'The stave', mins: 6,
            goal: 'Count stave lines and spaces from the bottom, and tell a step from a skip.',
            blocks: [
              { t: 'p', x: 'Music is written on a stave (also called a staff): five lines and the four spaces between them. Lines and spaces are always counted from the bottom up.' },
              { t: 'p', x: 'The higher a note sits on the stave, the higher it sounds. Moving from a line to the next space (or a space to the next line) is a step: the next letter in the alphabet. Moving from a line to the next line is a skip: you jump over one letter.' },
              { t: 'score', title: 'Steps climbing up, then skips', spec: { clef: 'treble', time: '4/4', music: 'e4:q f4 g4 a4 | b4:w | e4:q g4 b4 d5 | f5:w FIN' }, bpm: 80 },
              { t: 'tip', x: 'Reading by step and skip is faster than naming every note. Good readers name one note and read the rest as movement.' }
            ]
          }
        ]
      },
      {
        id: 'b2', title: 'Treble clef', lessons: [
          {
            id: 'b2-clef', title: 'The treble clef', mins: 6,
            goal: 'Find G4 from the treble clef and name the notes next to it.',
            blocks: [
              { t: 'p', x: 'A clef tells you which notes the lines mean. The treble clef is also called the G clef: its curl wraps around the second line, and that line is the G above middle C (G4).' },
              { t: 'score', title: 'G4 on the second line', spec: { clef: 'treble', noTime: true, music: 'g4:w' }, bpm: 70 },
              { t: 'p', x: 'Once you know G, a step up is A and a step down is F.' },
              { t: 'score', title: 'F, G, A', spec: { clef: 'treble', noTime: true, music: 'f4:h g4 | a4:h g4 FIN' }, bpm: 70 },
              { t: 'drill', title: 'Quick check: F, G or A?', clef: 'treble', pool: ['f4', 'g4', 'a4'], n: 8, mode: 'letters' }
            ]
          },
          {
            id: 'b2-lines', title: 'Treble line notes', mins: 10,
            goal: 'Name all five treble lines: E G B D F.',
            blocks: [
              { t: 'p', x: 'From the bottom line up, the treble lines are E, G, B, D and F. A memory sentence helps at first:' },
              { t: 'tip', x: 'Every Green Bus Drives Fast.' },
              { t: 'score', title: 'The five lines', spec: { clef: 'treble', noTime: true, music: 'e4:q g4 b4 d5 | f5:w FIN' }, bpm: 76 },
              { t: 'p', x: 'Notice that each line is a skip from the one below: E, (F), G, (A), B, (C), D, (E), F.' },
              { t: 'drill', title: 'Name the line notes', clef: 'treble', pool: 'treble-lines', n: 12, mode: 'letters' }
            ]
          },
          {
            id: 'b2-spaces', title: 'Treble space notes', mins: 8,
            goal: 'Name the four treble spaces: F A C E.',
            blocks: [
              { t: 'p', x: 'The spaces, from the bottom up, spell a word: F A C E.' },
              { t: 'score', title: 'F A C E', spec: { clef: 'treble', noTime: true, music: 'f4:q a4 c5 e5 FIN' }, bpm: 76 },
              { t: 'drill', title: 'Name the space notes', clef: 'treble', pool: 'treble-spaces', n: 10, mode: 'letters' },
              { t: 'drill', title: 'Lines and spaces together', clef: 'treble', pool: 'treble-staff', n: 15, mode: 'letters' }
            ]
          },
          {
            id: 'b2-keys', title: 'From the page to the keys', mins: 10,
            goal: 'See a treble note and play it in the right place on the keyboard.',
            blocks: [
              { t: 'p', x: 'Knowing the letter is half the job. The other half is finding the right one on the keyboard. The bottom line, E4, is the E just above middle C.' },
              { t: 'keys', title: 'The treble stave notes on the keyboard', from: 60, to: 77, labels: 'all', mark: ['e4', 'f4', 'g4', 'a4', 'b4', 'c5', 'd5', 'e5', 'f5'] },
              { t: 'drill', title: 'Play the note you see', clef: 'treble', pool: 'treble-staff', n: 12, mode: 'keys' }
            ]
          },
          {
            id: 'b2-landmarks', title: 'Treble landmarks', mins: 8,
            goal: 'Recognise middle C, G4, treble C and high G instantly.',
            blocks: [
              { t: 'p', x: 'Landmark notes are notes you know so well you never work them out. Read everything else as a step or skip from the nearest landmark.' },
              { t: 'score', title: 'Middle C, G4, treble C, high G', spec: { clef: 'treble', noTime: true, music: 'c4:q g4 c5 g5 FIN' }, bpm: 70 },
              { t: 'list', x: ['Middle C (C4): on its own short line below the stave.', 'G4: the line the clef curls round.', 'Treble C (C5): the third space.', 'High G (G5): sits on top of the stave.'] },
              { t: 'drill', title: 'Landmarks', clef: 'treble', pool: 'treble-landmarks', n: 10, mode: 'keys' }
            ]
          }
        ]
      },
      {
        id: 'b3', title: 'Bass clef', lessons: [
          {
            id: 'b3-clef', title: 'The bass clef', mins: 6,
            goal: 'Find F3 from the bass clef and name the notes next to it.',
            blocks: [
              { t: 'p', x: 'The bass clef is the F clef. Its two dots sit either side of the fourth line, and that line is the F below middle C (F3).' },
              { t: 'score', title: 'F3 between the dots', spec: { clef: 'bass', noTime: true, music: 'f3:w' }, bpm: 70 },
              { t: 'tip', x: 'The bass clef is not the treble clef moved down. The same line means a different letter, so learn it as a new map rather than translating.' },
              { t: 'score', title: 'E, F, G', spec: { clef: 'bass', noTime: true, music: 'e3:h f3 | g3:h f3 FIN' }, bpm: 70 },
              { t: 'drill', title: 'Quick check: E, F or G?', clef: 'bass', pool: ['e3', 'f3', 'g3'], n: 8, mode: 'letters' }
            ]
          },
          {
            id: 'b3-lines', title: 'Bass line notes', mins: 10,
            goal: 'Name all five bass lines: G B D F A.',
            blocks: [
              { t: 'p', x: 'From the bottom line up, the bass lines are G, B, D, F and A.' },
              { t: 'tip', x: 'Good Boys Deserve Football Always.' },
              { t: 'score', title: 'The five lines', spec: { clef: 'bass', noTime: true, music: 'g2:q b2 d3 f3 | a3:w FIN' }, bpm: 76 },
              { t: 'drill', title: 'Name the line notes', clef: 'bass', pool: 'bass-lines', n: 12, mode: 'letters' }
            ]
          },
          {
            id: 'b3-spaces', title: 'Bass space notes', mins: 8,
            goal: 'Name the four bass spaces: A C E G.',
            blocks: [
              { t: 'p', x: 'The bass spaces from the bottom up are A, C, E and G.' },
              { t: 'tip', x: 'All Cows Eat Grass.' },
              { t: 'score', title: 'A C E G', spec: { clef: 'bass', noTime: true, music: 'a2:q c3 e3 g3 FIN' }, bpm: 76 },
              { t: 'drill', title: 'Name the space notes', clef: 'bass', pool: 'bass-spaces', n: 10, mode: 'letters' },
              { t: 'drill', title: 'Lines and spaces together', clef: 'bass', pool: 'bass-staff', n: 15, mode: 'letters' }
            ]
          },
          {
            id: 'b3-keys', title: 'Bass notes on the keyboard', mins: 10,
            goal: 'Play bass clef notes in the right octave.',
            blocks: [
              { t: 'p', x: 'The bass stave covers the two octaves below middle C. The bottom line is G2; the top line is A3, just below middle C.' },
              { t: 'keys', title: 'The bass stave notes on the keyboard', from: 43, to: 60, labels: 'all', mark: ['g2', 'a2', 'b2', 'c3', 'd3', 'e3', 'f3', 'g3', 'a3'] },
              { t: 'drill', title: 'Play the note you see', clef: 'bass', pool: 'bass-staff', n: 12, mode: 'keys' }
            ]
          },
          {
            id: 'b3-landmarks', title: 'Bass landmarks', mins: 8,
            goal: 'Recognise bass C, F3, low G and middle C instantly.',
            blocks: [
              { t: 'score', title: 'Low G, bass C, F3, middle C', spec: { clef: 'bass', noTime: true, music: 'g2:q c3 f3 c4 FIN' }, bpm: 70 },
              { t: 'list', x: ['Low G (G2): the bottom line.', 'Bass C (C3): the second space.', 'F3: the line between the clef dots.', 'Middle C (C4): on its own short line above the stave.'] },
              { t: 'drill', title: 'Landmarks', clef: 'bass', pool: 'bass-landmarks', n: 10, mode: 'keys' }
            ]
          }
        ]
      },
      {
        id: 'b4', title: 'The grand stave', lessons: [
          {
            id: 'b4-grand', title: 'Two staves, one middle C', mins: 8,
            goal: 'See how the treble and bass staves join at middle C.',
            blocks: [
              { t: 'p', x: 'Piano music uses a grand stave: the treble stave on top, the bass stave below, joined by a brace. Usually the right hand reads the top stave and the left hand reads the bottom.' },
              { t: 'p', x: 'Middle C belongs to both. It sits on a short line just below the treble stave, or just above the bass stave. Same note, same key.' },
              { t: 'score', title: 'Middle C written in each clef', spec: { clef: 'grand', noTime: true, rh: 'c4:h r:h', lh: 'r:h c4:h' }, bpm: 70 },
              { t: 'score', title: 'Walking down from treble to bass', spec: { clef: 'grand', time: '4/4', rh: 'g4:q f4 e4 d4 | c4:w | r:w | r:w FIN', lh: 'r:w | r:w | c4:q b3 a3 g3 | f3:w FIN' }, bpm: 80 },
              { t: 'drill', title: 'Both clefs mixed', clef: 'grand', pool: { treble: 'treble-staff', bass: 'bass-staff' }, n: 15, mode: 'keys' }
            ]
          },
          {
            id: 'b4-ledger', title: 'Ledger lines', mins: 12,
            goal: 'Read notes just above and below each stave.',
            blocks: [
              { t: 'p', x: 'Notes outside the stave use short ledger lines. Keep counting line, space, line, space as if the stave carried on.' },
              { t: 'score', title: 'Below and above the treble stave', spec: { clef: 'treble', noTime: true, music: 'c4:q b3 a3 r:q | g5 a5 b5 c6 FIN' }, bpm: 70 },
              { t: 'score', title: 'Below and above the bass stave', spec: { clef: 'bass', noTime: true, music: 'f2:q e2 d2 c2 | b3 c4 d4 e4 FIN' }, bpm: 70 },
              { t: 'tip', x: 'A3 and B3 just below the treble stave are the same keys as A3 and B3 at the top of the bass stave. Middle C is not the only overlap.' },
              { t: 'drill', title: 'Treble with ledger lines', clef: 'treble', pool: 'treble-ledger', n: 15, mode: 'keys' },
              { t: 'drill', title: 'Bass with ledger lines', clef: 'bass', pool: 'bass-ledger', n: 15, mode: 'keys' }
            ]
          }
        ]
      },
      {
        id: 'b5', title: 'Rhythm and the beat', lessons: [
          {
            id: 'b5-values', title: 'Beats and note values', mins: 10,
            goal: 'Count semibreves, minims and crotchets against a steady beat.',
            blocks: [
              { t: 'p', x: 'Where a note sits tells you which key to play. Its shape tells you how long to hold it, counted in beats.' },
              { t: 'table', head: ['Note', 'Also called', 'Beats'], rows: [['Semibreve', 'Whole note', '4'], ['Minim', 'Half note', '2'], ['Crotchet', 'Quarter note', '1']] },
              { t: 'score', title: 'One semibreve, two minims, four crotchets', spec: { clef: 'treble', time: '4/4', music: 'g4:w | g4:h g4 | g4:q g4 g4 g4 FIN' }, bpm: 80 },
              { t: 'rhythm', id: 'r-crotchets' }
            ]
          },
          {
            id: 'b5-rests', title: 'Rests', mins: 8,
            goal: 'Keep counting through silence.',
            blocks: [
              { t: 'p', x: 'Every note value has a matching rest: a beat of silence that still counts. Keep the beat going in your head; do not skip it.' },
              { t: 'symbols', ids: ['semibreve-rest', 'minim-rest', 'crotchet-rest'] },
              { t: 'rhythm', id: 'r-rests' }
            ]
          },
          {
            id: 'b5-time', title: 'Time signatures and bars', mins: 8,
            goal: 'Read 4/4, 3/4 and 2/4 and count each bar correctly.',
            blocks: [
              { t: 'p', x: 'The time signature is the pair of numbers at the start. The top number says how many beats are in each bar. The bottom number says which note gets one beat: 4 means a crotchet.' },
              { t: 'symbols', ids: ['four-four', 'three-four', 'two-four'] },
              { t: 'p', x: 'Bar lines divide the music into bars. Each bar holds exactly the number of beats in the time signature. Beat 1 of each bar is the strongest.' },
              { t: 'rhythm', id: 'r-three' },
              { t: 'rhythm', id: 'r-dotted-minims' }
            ]
          },
          {
            id: 'b5-quavers', title: 'Quavers', mins: 10,
            goal: 'Count quavers as "1 and 2 and".',
            blocks: [
              { t: 'p', x: 'A quaver (eighth note) lasts half a beat. Two quavers fill one crotchet beat, and they are usually joined by a beam. Count them "1 and 2 and", saying the number on the beat.' },
              { t: 'score', title: 'Quavers beamed in pairs', spec: { clef: 'treble', time: '4/4', music: 'c5:8 c5 d5 d5 e5 e5 f5 f5 | g5:w FIN' }, bpm: 76 },
              { t: 'rhythm', id: 'r-quavers' },
              { t: 'rhythm', id: 'r-quaver-rests' }
            ]
          }
        ]
      },
      {
        id: 'b6', title: 'First pieces', lessons: [
          {
            id: 'b6-rh', title: 'Your first right-hand pieces', mins: 15,
            goal: 'Read and play a whole melody in the treble clef.',
            blocks: [
              { t: 'p', x: 'Put your right thumb on middle C and one finger on each white key up to G. This is C position: every note in these pieces falls under a finger, so you can keep your eyes on the music.' },
              { t: 'keys', title: 'C position, right hand', from: 60, to: 72, labels: 'all', mark: ['c4', 'd4', 'e4', 'f4', 'g4'] },
              { t: 'steps', x: ['Look at the first note and the time signature before you start.', 'Tap Listen once to hear it.', 'Play it step by step. The app waits for the right key.', 'Keep your eyes on the music, not your hand.'] },
              { t: 'piece', id: 'p-five-finger' },
              { t: 'piece', id: 'p-ode' },
              { t: 'piece', id: 'p-mary' }
            ]
          },
          {
            id: 'b6-lh', title: 'Your first left-hand pieces', mins: 15,
            goal: 'Read and play a melody in the bass clef.',
            blocks: [
              { t: 'p', x: 'Put your left little finger on C3 (bass C, the second space) and one finger on each key up to G3.' },
              { t: 'keys', title: 'C position, left hand', from: 48, to: 60, labels: 'all', mark: ['c3', 'd3', 'e3', 'f3', 'g3'] },
              { t: 'piece', id: 'p-five-finger-lh' },
              { t: 'piece', id: 'p-ode-lh' },
              { t: 'piece', id: 'p-frere' }
            ]
          },
          {
            id: 'b6-turns', title: 'Hands taking turns', mins: 15,
            goal: 'Read the grand stave, switching between the hands.',
            blocks: [
              { t: 'p', x: 'Now both staves are in play, but only one hand plays at a time. Watch for rests: a rest in one stave usually means the other hand is about to play.' },
              { t: 'piece', id: 'p-call' },
              { t: 'piece', id: 'p-ode-turns' },
              { t: 'checklist', key: 'b6-turns', items: ['Played Call and answer with no wrong notes', 'Played Ode to Joy, taking turns without stopping', 'Read the music without looking at your hands'] }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'intermediate', name: 'Intermediate', tag: 'Build',
    blurb: 'Key signatures and your first scales, chords and inversions, lead sheets, left-hand patterns, the pedal and how to learn a piece.',
    youCan: 'You can name notes in both clefs, slowly, and count simple rhythms.',
    units: [
      {
        id: 'i1', title: 'Sharps, flats and naturals', lessons: [
          {
            id: 'i1-accidentals', title: 'Sharps, flats and naturals', mins: 10,
            goal: 'Play a sharp, flat or natural note correctly.',
            blocks: [
              { t: 'p', x: 'A sharp (♯) raises a note by a semitone: play the very next key to the right. A flat (♭) lowers it: the very next key to the left. A natural (♮) cancels a sharp or flat.' },
              { t: 'symbols', ids: ['sharp', 'flat', 'natural'] },
              { t: 'keys', title: 'F, F♯ and G; B, B♭ and A', from: 64, to: 72, labels: 'all', mark: ['f4', 'f#4', 'bb4', 'b4'] },
              { t: 'tip', x: 'Usually a sharp or flat is a black key, but not always. E♯ is the white key F, and C♭ is the white key B.' },
              { t: 'drill', title: 'Treble notes with sharps and flats', clef: 'treble', pool: 'treble-staff', accidentals: true, n: 15, mode: 'keys' }
            ]
          },
          {
            id: 'i1-bar-rule', title: 'Accidentals last for the bar', mins: 6,
            goal: 'Apply an accidental to later notes in the same bar.',
            blocks: [
              { t: 'p', x: 'An accidental affects every later note on the same line or space in the same bar. The bar line cancels it.' },
              { t: 'score', title: 'All three Fs in bar 1 are sharp; bar 2 is back to F', spec: { clef: 'treble', time: '4/4', music: 'f#4:q g4 f#4 f#4 | f4:q g4 a4:h FIN' }, bpm: 76 },
              { t: 'p', x: 'Composers often add a courtesy natural in the next bar as a reminder, but you are expected to know the rule.' }
            ]
          },
          {
            id: 'i1-enharmonic', title: 'Two names, one key', mins: 6,
            goal: 'Know that C♯ and D♭ are the same key.',
            blocks: [
              { t: 'p', x: 'Every black key has two names. The one above C is C♯ or D♭; which name is used depends on the key of the music. Notes that sound the same but are spelt differently are called enharmonic.' },
              { t: 'keys', title: 'C♯ / D♭ and F♯ / G♭', from: 60, to: 67, labels: 'all', mark: ['c#4', 'f#4'] },
              { t: 'drill', title: 'Black keys in both spellings', clef: 'treble', pool: ['c#4', 'db4', 'd#4', 'eb4', 'f#4', 'gb4', 'g#4', 'ab4', 'a#4', 'bb4'], n: 12, mode: 'keys' }
            ]
          }
        ]
      },
      {
        id: 'i2', title: 'Key signatures and scales', lessons: [
          {
            id: 'i2-what', title: 'What a key signature does', mins: 8,
            goal: 'Apply the key signature to every note it affects.',
            blocks: [
              { t: 'p', x: 'Instead of writing the same sharp or flat over and over, music puts them once at the start of every line. This is the key signature. It applies to every note with that letter, in every octave, for the whole piece.' },
              { t: 'score', title: 'G major: every F is F♯', spec: { clef: 'treble', key: 'G', time: '4/4', music: 'g4:q a4 b4 c5 | d5 e5 f#5 g5 | f#4:w FIN' }, bpm: 80 },
              { t: 'tip', x: 'Before you play anything, look at the key signature and say the sharps or flats out loud.' }
            ]
          },
          {
            id: 'i2-sharps', title: 'Sharp keys', mins: 10,
            goal: 'Recognise G, D and A major from their sharps.',
            blocks: [
              { t: 'p', x: 'Sharps are always added in the same order: F C G D A E B. A mnemonic: Father Charles Goes Down And Ends Battle.' },
              { t: 'keysig', keys: ['G', 'D', 'A', 'E'] },
              { t: 'p', x: 'To name a sharp key, find the last sharp and go up a semitone. Last sharp C♯ means the key is D major.' },
              { t: 'piece', id: 'p-sharp-stroll' }
            ]
          },
          {
            id: 'i2-flats', title: 'Flat keys', mins: 10,
            goal: 'Recognise F, B♭ and E♭ major from their flats.',
            blocks: [
              { t: 'p', x: 'Flats are added in the reverse order: B E A D G C F. The mnemonic runs backwards: Battle Ends And Down Goes Charles\' Father.' },
              { t: 'keysig', keys: ['F', 'Bb', 'Eb', 'Ab'] },
              { t: 'p', x: 'To name a flat key, the second-to-last flat is the key. Flats B♭ E♭ A♭ means E♭ major. F major, with one flat, you simply learn.' },
              { t: 'piece', id: 'p-flat-waltz' }
            ]
          }
        ]
      },
      {
        id: 'i3', title: 'More rhythm', lessons: [
          {
            id: 'i3-dotted', title: 'Dotted notes', mins: 8,
            goal: 'Count dotted minims and dotted crotchets.',
            blocks: [
              { t: 'p', x: 'A dot adds half the note\'s value again. A dotted minim is 2 + 1 = 3 beats. A dotted crotchet is 1 + ½ = 1½ beats, usually followed by a quaver to complete the beat.' },
              { t: 'symbols', ids: ['dotted-note'] },
              { t: 'rhythm', id: 'r-dotted-crotchets' }
            ]
          },
          {
            id: 'i3-ties', title: 'Ties', mins: 6,
            goal: 'Hold tied notes through the beat or bar line.',
            blocks: [
              { t: 'p', x: 'A tie joins two notes of the same pitch into one longer note. Play the first and keep holding. A curve between different notes is a slur, not a tie.' },
              { t: 'symbols', ids: ['tie', 'slur'] },
              { t: 'rhythm', id: 'r-ties' }
            ]
          },
          {
            id: 'i3-six-eight', title: 'Six-eight time', mins: 8,
            goal: 'Feel 6/8 as two beats of three quavers.',
            blocks: [
              { t: 'p', x: 'In 6/8 there are six quavers in a bar, grouped three and three. It feels like two big beats, each a dotted crotchet. Count 1 2 3 4 5 6, leaning on 1 and 4.' },
              { t: 'rhythm', id: 'r-six-eight' }
            ]
          },
          {
            id: 'i3-pickup', title: 'Pickup bars and syncopation', mins: 10,
            goal: 'Start on a pickup and play notes off the beat.',
            blocks: [
              { t: 'p', x: 'Some pieces start with an incomplete bar, called a pickup or anacrusis. Count it as the end of a bar: if it has one crotchet in 4/4, count "4" and play.' },
              { t: 'rhythm', id: 'r-pickup' },
              { t: 'p', x: 'Syncopation puts the emphasis on the "and" between beats. Keep counting the beats steadily and the off-beat notes fall into place.' },
              { t: 'rhythm', id: 'r-syncopation' }
            ]
          }
        ]
      },
      {
        id: 'i4', title: 'Chords and reading faster', lessons: [
          {
            id: 'i4-intervals', title: 'Reading intervals', mins: 12,
            goal: 'Read the distance between notes without naming them.',
            blocks: [
              { t: 'p', x: 'An interval is the distance between two notes, counted in letter names including both ends. C to D is a 2nd; C to E is a 3rd.' },
              { t: 'table', head: ['Interval', 'How it looks'], rows: [['2nd', 'Line to next space (a step)'], ['3rd', 'Line to next line, or space to next space'], ['4th', 'Line to space, skipping one line'], ['5th', 'Line to line, skipping one line'], ['Octave', 'Line to space or space to line, 7 letters apart']] },
              { t: 'score', title: '2nd, 3rd, 4th, 5th, octave from C', spec: { clef: 'treble', time: '4/4', music: 'c4:q d4 c4 e4 | c4 f4 c4 g4 | c4:h c5 FIN' }, bpm: 80 },
              { t: 'intervals', clef: 'treble', max: 8, n: 10 }
            ]
          },
          {
            id: 'i4-chords', title: 'Reading chords', mins: 10,
            goal: 'Read a stacked triad as one shape.',
            blocks: [
              { t: 'p', x: 'A triad is three notes stacked in 3rds. On the stave it looks like a snowman: all lines or all spaces. Read the bottom note, then recognise the shape.' },
              { t: 'score', title: 'C, F and G chords', spec: { clef: 'grand', time: '4/4', rh: '(c4 e4 g4):h (c4 f4 a4) | (b3 d4 g4):h (c4 e4 g4) FIN', lh: 'c3:h f2 | g2:h c3 FIN' }, bpm: 72 },
              { t: 'piece', id: 'p-chord-walk' }
            ]
          },
          {
            id: 'i4-fingering', title: 'Finger numbers', mins: 6,
            goal: 'Follow the finger numbers written above notes.',
            blocks: [
              { t: 'p', x: 'Small numbers above or below notes tell you which finger to use. Thumbs are 1 and little fingers are 5, on both hands.' },
              { t: 'score', title: 'Right hand fingering, with a thumb tuck', spec: { clef: 'treble', time: '4/4', music: 'c4:q@1 d4@2 e4@3 f4@1 | g4@2 a4@3 b4@4 c5@5 FIN' }, bpm: 72 },
              { t: 'piece', id: 'p-c-scale' }
            ]
          }
        ]
      },
      {
        id: 'i5', title: 'Expression', lessons: [
          {
            id: 'i5-dynamics', title: 'Dynamics', mins: 8,
            goal: 'Know how loud to play from p, mf, f and hairpins.',
            blocks: [
              { t: 'p', x: 'Dynamics are written in Italian, abbreviated to bold italic letters under the stave. p (piano) means quiet and f (forte) means loud. That is why the piano was named the pianoforte: it could play both.' },
              { t: 'symbols', ids: ['pp', 'p', 'mp', 'mf', 'f', 'ff', 'cresc', 'dim'] }
            ]
          },
          {
            id: 'i5-articulation', title: 'Articulation', mins: 8,
            goal: 'Play staccato, legato and accented notes.',
            blocks: [
              { t: 'symbols', ids: ['staccato', 'slur', 'accent', 'tenuto', 'fermata'] },
              { t: 'score', title: 'Legato then staccato', spec: { clef: 'treble', time: '4/4', music: 'S( c5:q d5 e5 f5 S) | g5:q^st f5^st e5^st d5^st | c5:w^fe FIN' }, bpm: 84 }
            ]
          },
          {
            id: 'i5-tempo', title: 'Tempo marks', mins: 6,
            goal: 'Know roughly how fast Andante, Allegro and the rest are.',
            blocks: [
              { t: 'p', x: 'The speed of a piece is written above the first bar, usually in Italian, sometimes with a metronome mark such as ♩ = 96.' },
              { t: 'symbols', ids: ['largo', 'adagio', 'andante', 'moderato', 'allegro', 'presto', 'rit', 'a-tempo'] }
            ]
          },
          {
            id: 'i5-repeats', title: 'Repeats and road signs', mins: 8,
            goal: 'Follow repeats, D.C. and D.S. without getting lost.',
            blocks: [
              { t: 'p', x: 'Repeat signs and jumps save printing the same music twice. Before you start, scan the page for them and plan your route.' },
              { t: 'symbols', ids: ['repeat', 'dc', 'ds', 'segno', 'coda', 'fine'] }
            ]
          },
          {
            id: 'i5-pedal', title: 'Pedal marks', mins: 6,
            goal: 'Know when to press and lift the sustain pedal.',
            blocks: [
              { t: 'p', x: 'The right-hand pedal lets notes ring on after you let go. Ped. means press it down; a star or the end of a bracket means lift.' },
              { t: 'symbols', ids: ['pedal', 'pedal-up'] },
              { t: 'piece', id: 'p-ode-hands' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'advanced', name: 'Advanced', tag: 'Fluency',
    blurb: 'Scales in every key, minor keys, hand independence, swing, seventh chords, sight-reading at the keyboard, improvising and performing.',
    youCan: 'You can read both clefs with key signatures, play some scales and play simple pieces hands together.',
    units: [
      {
        id: 'a1', title: 'All the keys', lessons: [
          {
            id: 'a1-circle', title: 'The circle of fifths', mins: 10,
            goal: 'Know how many sharps or flats every major key has.',
            blocks: [
              { t: 'p', x: 'Going up a 5th from C adds one sharp each time: C, G, D, A, E, B, F♯, C♯. Going down a 5th adds one flat each time: F, B♭, E♭, A♭, D♭, G♭, C♭.' },
              { t: 'keysig', keys: ['B', 'F#', 'Db', 'Gb'] },
              { t: 'tip', x: 'The Keys page in the Library shows the whole circle. Tap any key to see its signature and hear its scale.' }
            ]
          },
          {
            id: 'a1-minor', title: 'Minor keys', mins: 10,
            goal: 'Tell a major key from its relative minor.',
            blocks: [
              { t: 'p', x: 'Every key signature belongs to a major key and a minor key. The minor key starts three semitones below the major: no sharps or flats is C major or A minor.' },
              { t: 'p', x: 'To tell which one a piece is in, look at the last bass note (usually the key note) and look for a raised 7th: in A minor you will see G♯ accidentals.' },
              { t: 'score', title: 'A minor, with the raised 7th G♯', spec: { clef: 'treble', key: 'Am', time: '4/4', music: 'a4:q b4 c5 d5 | e5 f5 g#5 a5 | e5:h g#4 | a4:w FIN' }, bpm: 80 },
              { t: 'piece', id: 'p-greensleeves' }
            ]
          }
        ]
      },
      {
        id: 'a2', title: 'Advanced rhythm', lessons: [
          {
            id: 'a2-semiquavers', title: 'Semiquavers', mins: 10,
            goal: 'Count four semiquavers to the beat.',
            blocks: [
              { t: 'p', x: 'Semiquavers (sixteenth notes) have two beams and last a quarter of a beat. Count "1 e and a, 2 e and a".' },
              { t: 'rhythm', id: 'r-semiquavers' },
              { t: 'rhythm', id: 'r-dotted-quavers' }
            ]
          },
          {
            id: 'a2-triplets', title: 'Triplets', mins: 8,
            goal: 'Fit three even notes into one beat.',
            blocks: [
              { t: 'p', x: 'A triplet squeezes three notes into the time of two. Quaver triplets fit three to a crotchet beat. Say "tri-pl-et" evenly on each beat.' },
              { t: 'rhythm', id: 'r-triplets' }
            ]
          },
          {
            id: 'a2-offbeat', title: 'Rests on the beat', mins: 8,
            goal: 'Play notes that start just after the beat.',
            blocks: [
              { t: 'p', x: 'The hardest rhythms put a rest on the beat and the note on the "and". Feel the silent beat in your body: nod your head on it.' },
              { t: 'rhythm', id: 'r-waltz-sync' },
              { t: 'rhythm', id: 'r-offbeat-rests' }
            ]
          }
        ]
      },
      {
        id: 'a3', title: 'Beyond the stave', lessons: [
          {
            id: 'a3-far-ledger', title: 'Far ledger lines and 8va', mins: 12,
            goal: 'Read three ledger lines and octave signs.',
            blocks: [
              { t: 'p', x: 'Far ledger notes are easiest from landmarks. Above the treble stave, C6 sits on the second ledger line. Below the bass stave, C2 sits on the second ledger line. Read from there by step and skip.' },
              { t: 'score', title: 'C6 and C2', spec: { clef: 'grand', noTime: true, rh: 'c6:h e6', lh: 'c2:h a1' }, bpm: 70 },
              { t: 'p', x: 'When notes climb even higher, composers write 8va over them: play an octave higher than written. 8vb under the notes means an octave lower.' },
              { t: 'symbols', ids: ['ottava', 'ottava-bassa'] },
              { t: 'drill', title: 'Wide range, treble', clef: 'treble', pool: 'treble-wide', n: 15, mode: 'keys' },
              { t: 'drill', title: 'Wide range, bass', clef: 'bass', pool: 'bass-wide', n: 15, mode: 'keys' }
            ]
          },
          {
            id: 'a3-clef-change', title: 'Clef changes', mins: 8,
            goal: 'Keep reading when a clef changes mid-line.',
            blocks: [
              { t: 'p', x: 'When the left hand goes high, the bottom stave may switch to treble clef. The new clef is printed smaller, and applies until another clef appears.' },
              { t: 'score', title: 'Bass clef switching to treble and back', spec: { clef: 'bass', time: '4/4', music: 'c3:q e3 g3 c4 | clef=treble e4 g4 c5:h | clef=bass c4:q g3 e3 c3 FIN' }, bpm: 76 },
              { t: 'tip', x: 'Spot clef changes before you start playing. Many wrong notes in sight-reading are really missed clefs.' }
            ]
          },
          {
            id: 'a3-ornaments', title: 'Ornaments', mins: 8,
            goal: 'Recognise and play trills, mordents and turns.',
            blocks: [
              { t: 'symbols', ids: ['trill', 'mordent', 'turn'] },
              { t: 'tip', x: 'In Baroque music trills usually start on the note above; in later music they start on the written note. When unsure, start on the written note.' }
            ]
          }
        ]
      },
      {
        id: 'a4', title: 'Sight-reading', lessons: [
          {
            id: 'a4-scan', title: 'Scan before you play', mins: 8,
            goal: 'Use a 30-second check before playing anything new.',
            blocks: [
              { t: 'steps', x: ['Key signature: say the sharps or flats out loud.', 'Time signature: count one bar out loud.', 'Look for clef changes, accidentals and repeat signs.', 'Find the highest and lowest notes in each hand and set your hands.', 'Pick a tempo slow enough to keep going without stopping.'] },
              { t: 'tip', x: 'Keep going even if you play a wrong note. A steady beat with mistakes sounds better than correct notes with stops.' }
            ]
          },
          {
            id: 'a4-ahead', title: 'Read ahead and in shapes', mins: 10,
            goal: 'Look one beat ahead and read patterns, not single notes.',
            blocks: [
              { t: 'p', x: 'Fluent readers look ahead while playing, and they read shapes: a scale run, a broken chord, a repeated pattern. Name the first note, then follow the shape.' },
              { t: 'piece', id: 'p-prelude' },
              { t: 'piece', id: 'p-fur-elise' }
            ]
          },
          {
            id: 'a4-routine', title: 'A daily reading routine', mins: 6,
            goal: 'Build reading into ten minutes a day.',
            blocks: [
              { t: 'list', x: ['2 minutes: a speed challenge in each clef (Practise tab).', '2 minutes: weak-notes drill.', '3 minutes: one rhythm exercise.', '3 minutes: one new piece you have never seen, played once without stopping.'] },
              { t: 'checklist', key: 'a4-routine', items: ['Did the routine 5 days in a row', 'Beat my speed challenge score in both clefs', 'Read a new piece without stopping'] }
            ]
          }
        ]
      }
    ]
  }
];

/* ALL_LESSONS is built in data-playing.js, after the playing lessons are woven in */
