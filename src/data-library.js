/* ============================================================
   Library data: symbols, note values, rhythm exercises, pieces.
   ============================================================ */

/* Shorthand pools for note drills */
const POOLS = {
  'treble-lines': ['e4', 'g4', 'b4', 'd5', 'f5'],
  'treble-spaces': ['f4', 'a4', 'c5', 'e5'],
  'treble-staff': ['e4', 'f4', 'g4', 'a4', 'b4', 'c5', 'd5', 'e5', 'f5'],
  'treble-landmarks': ['c4', 'g4', 'c5', 'g5'],
  'treble-ledger': ['a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5', 'd5', 'e5', 'f5', 'g5', 'a5', 'b5', 'c6'],
  'treble-wide': ['f3', 'g3', 'a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5', 'd5', 'e5', 'f5', 'g5', 'a5', 'b5', 'c6', 'd6', 'e6'],
  'bass-lines': ['g2', 'b2', 'd3', 'f3', 'a3'],
  'bass-spaces': ['a2', 'c3', 'e3', 'g3'],
  'bass-staff': ['g2', 'a2', 'b2', 'c3', 'd3', 'e3', 'f3', 'g3', 'a3'],
  'bass-landmarks': ['c3', 'f3', 'c4', 'g2'],
  'bass-ledger': ['c2', 'd2', 'e2', 'f2', 'g2', 'a2', 'b2', 'c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3', 'c4', 'd4', 'e4'],
  'bass-wide': ['a1', 'b1', 'c2', 'd2', 'e2', 'f2', 'g2', 'a2', 'b2', 'c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g4'],
  'middle-c': ['c4']
};

/* ---------------- Symbols ---------------- */
const SYMBOL_CATS = ['Clefs and staves', 'Notes', 'Rests', 'Accidentals', 'Time', 'Dynamics', 'Articulation', 'Ornaments', 'Repeats and endings', 'Pedal and octave', 'Tempo terms'];
const SYMBOLS = [
  // Clefs and staves
  { id: 'treble-clef', cat: 'Clefs and staves', name: 'Treble clef', aka: 'G clef', glyph: ['gClef'], size: 30, y: 0.72,
    meaning: 'Curls around the second line up, which is the G above middle C. Used for higher notes, usually the right hand.', ex: { clef: 'treble', music: 'g4:w', noTime: true } },
  { id: 'bass-clef', cat: 'Clefs and staves', name: 'Bass clef', aka: 'F clef', glyph: ['fClef'], size: 34, y: 0.48,
    meaning: 'Its two dots sit either side of the fourth line, which is the F below middle C. Used for lower notes, usually the left hand.', ex: { clef: 'bass', music: 'f3:w', noTime: true } },
  { id: 'grand-stave', cat: 'Clefs and staves', name: 'Grand stave', aka: 'Grand staff',
    meaning: 'A treble stave and a bass stave joined by a brace. Piano music is written on it. Middle C sits on a ledger line exactly halfway between the two.', ex: { clef: 'grand', rh: 'c4:w', lh: 'r:w', noTime: true } },
  { id: 'ledger-lines', cat: 'Clefs and staves', name: 'Ledger lines', aka: '',
    meaning: 'Short extra lines above or below the stave for notes that go beyond it. Read them exactly like stave lines: line, space, line, space.', ex: { clef: 'treble', music: 'a3:q c4 a5 c6', noTime: true } },
  { id: 'bar-line', cat: 'Clefs and staves', name: 'Bar line', aka: 'Measure line',
    meaning: 'Divides the music into bars of equal length. A double bar line marks the end of a section; a thick final bar line marks the end of the piece.', ex: { clef: 'treble', music: 'c5:h c5 | e5:h e5 DBL | g5:w FIN', noTime: true } },
  // Notes
  { id: 'semibreve', cat: 'Notes', name: 'Semibreve', aka: 'Whole note', glyph: ['noteheadWhole'], size: 44,
    meaning: 'An open note head with no stem. Lasts 4 beats in 4/4.', ex: { clef: 'treble', music: 'b4:w', time: '4/4' }, beats: 4 },
  { id: 'minim', cat: 'Notes', name: 'Minim', aka: 'Half note',
    meaning: 'An open note head with a stem. Lasts 2 beats.', ex: { clef: 'treble', music: 'b4:h b4', time: '4/4' }, beats: 2 },
  { id: 'crotchet', cat: 'Notes', name: 'Crotchet', aka: 'Quarter note',
    meaning: 'A filled-in note head with a stem. Lasts 1 beat, the beat you usually count.', ex: { clef: 'treble', music: 'b4:q b4 b4 b4', time: '4/4' }, beats: 1 },
  { id: 'quaver', cat: 'Notes', name: 'Quaver', aka: 'Eighth note',
    meaning: 'A crotchet with one flag, or joined to its neighbours by one beam. Lasts half a beat. Count them "1 and 2 and".', ex: { clef: 'treble', music: 'b4:8 b4 b4 b4 b4 b4 b4 b4', time: '4/4' }, beats: 0.5 },
  { id: 'semiquaver', cat: 'Notes', name: 'Semiquaver', aka: 'Sixteenth note',
    meaning: 'Two flags or two beams. Lasts a quarter of a beat: four to every crotchet. Count them "1 e and a".', ex: { clef: 'treble', music: 'b4:16 b4 b4 b4 b4 b4 b4 b4 b4:h', time: '4/4' }, beats: 0.25 },
  { id: 'dotted-note', cat: 'Notes', name: 'Dotted note', aka: '',
    meaning: 'A dot after a note adds half of its value again. A dotted minim lasts 3 beats; a dotted crotchet lasts 1½.', ex: { clef: 'treble', music: 'b4:h. b4:q | b4:q. b4:8 b4:h', time: '4/4' } },
  { id: 'tie', cat: 'Notes', name: 'Tie', aka: '',
    meaning: 'A curve joining two notes of the same pitch. Play the first note and hold it for the length of both. Do not play the second note again.', ex: { clef: 'treble', music: 'g4:h g4:h~ | g4:h g4:h', time: '4/4' } },
  { id: 'triplet', cat: 'Notes', name: 'Triplet', aka: '',
    meaning: 'Three notes squeezed into the time of two. A quaver triplet fills one crotchet beat.', ex: { clef: 'treble', music: 'b4:8t b4 b4 b4:8t b4 b4 b4:h', time: '4/4' } },
  { id: 'chord', cat: 'Notes', name: 'Chord', aka: '',
    meaning: 'Notes stacked on one stem are played together. A stack of line, line, line (or space, space, space) is a triad.', ex: { clef: 'treble', music: '(c4 e4 g4):h (f4 a4 c5):h | (g4 b4 d5):h (c4 e4 g4):h', time: '4/4' } },
  // Rests
  { id: 'semibreve-rest', cat: 'Rests', name: 'Semibreve rest', aka: 'Whole rest', glyph: ['restWhole'], size: 44, y: 0.42,
    meaning: 'Hangs down from the fourth line. A whole bar of silence in any time signature.', ex: { clef: 'treble', music: 'r:w', time: '4/4' } },
  { id: 'minim-rest', cat: 'Rests', name: 'Minim rest', aka: 'Half rest', glyph: ['restHalf'], size: 44, y: 0.55,
    meaning: 'Sits on top of the middle line. 2 beats of silence. Tip: the minim rest looks like a hat sitting on the line.', ex: { clef: 'treble', music: 'b4:h r:h', time: '4/4' } },
  { id: 'crotchet-rest', cat: 'Rests', name: 'Crotchet rest', aka: 'Quarter rest', glyph: ['restQuarter'], size: 44,
    meaning: 'A zig-zag shape. 1 beat of silence.', ex: { clef: 'treble', music: 'b4:q r:q b4:q r:q', time: '4/4' } },
  { id: 'quaver-rest', cat: 'Rests', name: 'Quaver rest', aka: 'Eighth rest', glyph: ['rest8th'], size: 44,
    meaning: 'Half a beat of silence. Looks like a 7 with a dot.', ex: { clef: 'treble', music: 'r:8 b4:8 r:8 b4:8 b4:h', time: '4/4' } },
  { id: 'semiquaver-rest', cat: 'Rests', name: 'Semiquaver rest', aka: 'Sixteenth rest', glyph: ['rest16th'], size: 44,
    meaning: 'A quarter of a beat of silence. Like the quaver rest with two flags.', ex: { clef: 'treble', music: 'r:16 b4:16 b4:16 b4:16 b4:q b4:h', time: '4/4' } },
  // Accidentals
  { id: 'sharp', cat: 'Accidentals', name: 'Sharp', aka: '♯', glyph: ['accidentalSharp'], size: 44,
    meaning: 'Raises a note by a semitone: play the very next key to the right, black or white. It lasts until the end of the bar.', ex: { clef: 'treble', music: 'f4:q f#4 f#4 f4', time: '4/4' } },
  { id: 'flat', cat: 'Accidentals', name: 'Flat', aka: '♭', glyph: ['accidentalFlat'], size: 44,
    meaning: 'Lowers a note by a semitone: play the very next key to the left. It lasts until the end of the bar.', ex: { clef: 'treble', music: 'b4:q bb4 bb4 b4', time: '4/4' } },
  { id: 'natural', cat: 'Accidentals', name: 'Natural', aka: '♮', glyph: ['accidentalNatural'], size: 44,
    meaning: 'Cancels a sharp or flat, from the key signature or earlier in the bar. Play the white key.', ex: { clef: 'treble', key: 'G', music: 'f#4:q fn4 f#4:h', time: '4/4' } },
  { id: 'double-sharp', cat: 'Accidentals', name: 'Double sharp', aka: '𝄪', glyph: ['accidentalDoubleSharp'], size: 44,
    meaning: 'Raises a note by two semitones. F double sharp sounds the same as G. Rare, but you will meet it in harmonic minor keys.', ex: { clef: 'treble', music: 'f##4:h g4:h', time: '4/4' } },
  { id: 'double-flat', cat: 'Accidentals', name: 'Double flat', aka: '𝄫', glyph: ['accidentalDoubleFlat'], size: 44,
    meaning: 'Lowers a note by two semitones. B double flat sounds the same as A.', ex: { clef: 'treble', music: 'bbb4:h a4:h', time: '4/4' } },
  { id: 'key-signature', cat: 'Accidentals', name: 'Key signature', aka: '',
    meaning: 'Sharps or flats at the start of every line. They apply to every note with that letter name, in every octave, for the whole piece.', ex: { clef: 'treble', key: 'D', music: 'd4:q f#4 a4 c#5', time: '4/4' } },
  // Time
  { id: 'four-four', cat: 'Time', name: '4/4 time', aka: 'Common time', glyph: ['timeSig4', 'timeSig4'], stack: true, size: 40,
    meaning: 'Four crotchet beats in each bar. The top number is how many beats; the bottom number is which note gets the beat (4 = crotchet).', ex: { clef: 'treble', time: '4/4', music: 'b4:q b4 b4 b4 | b4:h b4' } },
  { id: 'common-time', cat: 'Time', name: 'Common time', aka: 'C', glyph: ['timeSigCommon'], size: 44,
    meaning: 'Another way of writing 4/4.', ex: { clef: 'treble', time: 'C', music: 'b4:q b4 b4 b4' } },
  { id: 'three-four', cat: 'Time', name: '3/4 time', aka: 'Waltz time', glyph: ['timeSig3', 'timeSig4'], stack: true, size: 40,
    meaning: 'Three crotchet beats in a bar, with the strongest on beat 1. The feel of a waltz or minuet.', ex: { clef: 'treble', time: '3/4', music: 'b4:q b4 b4 | b4:h.' } },
  { id: 'two-four', cat: 'Time', name: '2/4 time', aka: '', glyph: ['timeSig2', 'timeSig4'], stack: true, size: 40,
    meaning: 'Two crotchet beats in a bar. The feel of a march.', ex: { clef: 'treble', time: '2/4', music: 'b4:q b4 | b4:h' } },
  { id: 'six-eight', cat: 'Time', name: '6/8 time', aka: 'Compound time', glyph: ['timeSig6', 'timeSig8'], stack: true, size: 40,
    meaning: 'Six quavers in a bar, grouped in two sets of three. It feels like two lilting beats, each a dotted crotchet.', ex: { clef: 'treble', time: '6/8', music: 'b4:8 b4 b4 b4 b4 b4 | b4:q. b4:q.' } },
  { id: 'cut-time', cat: 'Time', name: 'Cut time', aka: '2/2, alla breve', glyph: ['timeSigCutCommon'], size: 44,
    meaning: 'Two minim beats in a bar. Looks like 4/4 but is counted in 2, so it feels faster.', ex: { clef: 'treble', time: '2/2', music: 'b4:h b4 | b4:w' } },
  // Dynamics
  { id: 'pp', cat: 'Dynamics', name: 'pianissimo', aka: 'pp', glyph: ['dynamicPiano', 'dynamicPiano'], size: 44, meaning: 'Very quiet.' },
  { id: 'p', cat: 'Dynamics', name: 'piano', aka: 'p', glyph: ['dynamicPiano'], size: 44, meaning: 'Quiet.' },
  { id: 'mp', cat: 'Dynamics', name: 'mezzo piano', aka: 'mp', glyph: ['dynamicMezzo', 'dynamicPiano'], size: 44, meaning: 'Moderately quiet.' },
  { id: 'mf', cat: 'Dynamics', name: 'mezzo forte', aka: 'mf', glyph: ['dynamicMezzo', 'dynamicForte'], size: 44, meaning: 'Moderately loud. The most common starting dynamic.' },
  { id: 'f', cat: 'Dynamics', name: 'forte', aka: 'f', glyph: ['dynamicForte'], size: 44, meaning: 'Loud.' },
  { id: 'ff', cat: 'Dynamics', name: 'fortissimo', aka: 'ff', glyph: ['dynamicForte', 'dynamicForte'], size: 44, meaning: 'Very loud.' },
  { id: 'sfz', cat: 'Dynamics', name: 'sforzando', aka: 'sfz', glyph: ['dynamicSforzando', 'dynamicForte', 'dynamicZ'], size: 40, meaning: 'A sudden strong accent on one note.' },
  { id: 'cresc', cat: 'Dynamics', name: 'Crescendo', aka: 'cresc.', meaning: 'Get gradually louder. Written as an opening hairpin or the word cresc.', ex: { clef: 'treble', music: '<( c5:q d5 e5 f5 )< | g5:w', time: '4/4' } },
  { id: 'dim', cat: 'Dynamics', name: 'Diminuendo', aka: 'dim. or decresc.', meaning: 'Get gradually quieter. Written as a closing hairpin or the word dim.', ex: { clef: 'treble', music: '>( g5:q f5 e5 d5 )> | c5:w', time: '4/4' } },
  // Articulation
  { id: 'staccato', cat: 'Articulation', name: 'Staccato', aka: 'dot', glyph: ['articStaccatoAbove'], size: 44,
    meaning: 'A dot above or below the note head. Play the note short and detached.', ex: { clef: 'treble', music: 'c5:q^st d5^st e5^st f5^st | g5:w', time: '4/4' } },
  { id: 'accent', cat: 'Articulation', name: 'Accent', aka: '>', glyph: ['articAccentAbove'], size: 44,
    meaning: 'Play this note louder than the ones around it.', ex: { clef: 'treble', music: 'c5:q^ac d5 e5^ac f5 | g5:w', time: '4/4' } },
  { id: 'tenuto', cat: 'Articulation', name: 'Tenuto', aka: 'line', glyph: ['articTenutoAbove'], size: 44,
    meaning: 'Hold the note for its full value, with slight weight.', ex: { clef: 'treble', music: 'c5:q^te d5^te e5^te f5^te | g5:w', time: '4/4' } },
  { id: 'marcato', cat: 'Articulation', name: 'Marcato', aka: '^', glyph: ['articMarcatoAbove'], size: 44,
    meaning: 'A strong, marked accent: stronger than a normal accent.', ex: { clef: 'treble', music: 'c5:q^ma r:q c5^ma r:q | c5:w', time: '4/4' } },
  { id: 'slur', cat: 'Articulation', name: 'Slur', aka: 'legato',
    meaning: 'A curve over different notes. Play them smoothly joined, with no gaps (legato). Lift slightly at the end of the slur.', ex: { clef: 'treble', music: 'S( c5:q d5 e5 f5 S) | g5:w', time: '4/4' } },
  { id: 'fermata', cat: 'Articulation', name: 'Pause', aka: 'fermata', glyph: ['fermataAbove'], size: 44,
    meaning: 'Hold the note longer than its written value, then carry on.', ex: { clef: 'treble', music: 'c5:q d5 e5 f5 | g5:w^fe', time: '4/4' } },
  // Ornaments
  { id: 'trill', cat: 'Ornaments', name: 'Trill', aka: 'tr', glyph: ['ornamentTrill'], size: 44,
    meaning: 'Alternate rapidly between the written note and the note above it.', ex: { clef: 'treble', music: 'd5:h^tr c5:h', time: '4/4' } },
  { id: 'mordent', cat: 'Ornaments', name: 'Mordent', aka: '', glyph: ['ornamentMordent'], size: 44,
    meaning: 'A quick written note, the note below, and back again: like a very short trill downwards.', ex: { clef: 'treble', music: 'e5:h^mo d5:h', time: '4/4' } },
  { id: 'turn', cat: 'Ornaments', name: 'Turn', aka: '', glyph: ['ornamentTurn'], size: 44,
    meaning: 'Play the note above, the written note, the note below, then the written note again.', ex: { clef: 'treble', music: 'd5:h^tu c5:h', time: '4/4' } },
  // Repeats and endings
  { id: 'repeat', cat: 'Repeats and endings', name: 'Repeat signs', aka: '',
    meaning: 'Play the music between the dots twice. If there is no start sign, go back to the beginning.', ex: { clef: 'treble', music: 'RS c5:q d5 e5 f5 | g5:w RE', time: '4/4' } },
  { id: 'segno', cat: 'Repeats and endings', name: 'Segno', aka: 'sign', glyph: ['segno'], size: 44,
    meaning: 'A marker. D.S. (dal segno) tells you to jump back to this sign.' },
  { id: 'coda', cat: 'Repeats and endings', name: 'Coda', aka: 'tail', glyph: ['coda'], size: 44,
    meaning: 'An ending section. "To Coda" tells you to jump from that point to the coda sign.' },
  { id: 'dc', cat: 'Repeats and endings', name: 'D.C. al Fine', aka: 'da capo', text: 'D.C.',
    meaning: 'Go back to the beginning (da capo = from the head) and play until the word Fine.' },
  { id: 'ds', cat: 'Repeats and endings', name: 'D.S. al Coda', aka: 'dal segno', text: 'D.S.',
    meaning: 'Go back to the segno sign, play to "To Coda", then jump to the coda.' },
  { id: 'fine', cat: 'Repeats and endings', name: 'Fine', aka: 'end', text: 'Fine', meaning: 'The end of the piece after a D.C. or D.S. jump.' },
  // Pedal and octave
  { id: 'pedal', cat: 'Pedal and octave', name: 'Sustain pedal', aka: 'Ped.', glyph: ['keyboardPedalPed'], size: 34,
    meaning: 'Press the right-hand pedal at Ped. and lift it at the star or the end of the bracket. Notes keep ringing while it is down.', ex: { clef: 'bass', music: 'P( c3:q e3 g3 c4 P) | (c3 e3 g3):w', time: '4/4' } },
  { id: 'pedal-up', cat: 'Pedal and octave', name: 'Pedal release', aka: '*', glyph: ['keyboardPedalUp'], size: 40, meaning: 'Lift the sustain pedal.' },
  { id: 'ottava', cat: 'Pedal and octave', name: 'Octave higher', aka: '8va',
    meaning: 'Play the notes under the dotted line an octave higher than written. It saves writing lots of ledger lines.', ex: { clef: 'treble', music: '8va( c6:q d6 e6 f6 )8va | g5:w', time: '4/4' } },
  { id: 'ottava-bassa', cat: 'Pedal and octave', name: 'Octave lower', aka: '8vb',
    meaning: 'Play the notes over the dotted line an octave lower than written.', ex: { clef: 'bass', music: '8vb( c2:q d2 e2 f2 )8vb | g2:w', time: '4/4' } },
  // Tempo terms
  { id: 'largo', cat: 'Tempo terms', name: 'Largo', aka: '40–60 bpm', text: 'Largo', meaning: 'Very slow and broad.' },
  { id: 'adagio', cat: 'Tempo terms', name: 'Adagio', aka: '66–76 bpm', text: 'Adagio', meaning: 'Slow and relaxed.' },
  { id: 'andante', cat: 'Tempo terms', name: 'Andante', aka: '76–108 bpm', text: 'Andante', meaning: 'At a walking pace.' },
  { id: 'moderato', cat: 'Tempo terms', name: 'Moderato', aka: '108–120 bpm', text: 'Moderato', meaning: 'At a moderate speed.' },
  { id: 'allegro', cat: 'Tempo terms', name: 'Allegro', aka: '120–156 bpm', text: 'Allegro', meaning: 'Fast and lively.' },
  { id: 'presto', cat: 'Tempo terms', name: 'Presto', aka: '168–200 bpm', text: 'Presto', meaning: 'Very fast.' },
  { id: 'rit', cat: 'Tempo terms', name: 'ritardando', aka: 'rit. or rall.', text: 'rit.', meaning: 'Gradually slow down.' },
  { id: 'accel', cat: 'Tempo terms', name: 'accelerando', aka: 'accel.', text: 'accel.', meaning: 'Gradually speed up.' },
  { id: 'a-tempo', cat: 'Tempo terms', name: 'a tempo', aka: '', text: 'a tempo', meaning: 'Return to the original speed.' },
  { id: 'legato-term', cat: 'Tempo terms', name: 'legato', aka: '', text: 'legato', meaning: 'Smoothly, with the notes joined.' },
  { id: 'dolce', cat: 'Tempo terms', name: 'dolce', aka: '', text: 'dolce', meaning: 'Sweetly and gently.' },
  { id: 'cantabile', cat: 'Tempo terms', name: 'cantabile', aka: '', text: 'cantabile', meaning: 'In a singing style: bring the melody out.' }
];

/* ---------------- Note values ---------------- */
const NOTE_VALUES = [
  { uk: 'Semibreve', us: 'Whole note', beats: '4', music: 'b4:w', rest: 'r:w' },
  { uk: 'Dotted minim', us: 'Dotted half note', beats: '3', music: 'b4:h.', rest: 'r:h.' },
  { uk: 'Minim', us: 'Half note', beats: '2', music: 'b4:h', rest: 'r:h' },
  { uk: 'Dotted crotchet', us: 'Dotted quarter note', beats: '1½', music: 'b4:q.', rest: 'r:q.' },
  { uk: 'Crotchet', us: 'Quarter note', beats: '1', music: 'b4:q', rest: 'r:q' },
  { uk: 'Quaver', us: 'Eighth note', beats: '½', music: 'b4:8', rest: 'r:8' },
  { uk: 'Semiquaver', us: 'Sixteenth note', beats: '¼', music: 'b4:16', rest: 'r:16' },
  { uk: 'Triplet quavers', us: 'Eighth-note triplet', beats: '⅓ each', music: 'b4:8t b4 b4', rest: null }
];

/* ---------------- Rhythm exercises ----------------
   r: durations only (q h w 8 16, "." dotted, "t" triplet, "~" tie, r:q rest) */
const RHYTHMS = [
  { id: 'r-crotchets', title: 'Crotchets and minims', level: 'beginner', time: '4/4', bpm: 72, r: 'q q q q | h h | q q h | w', count: '1 2 3 4 | 1 (2) 3 (4) | 1 2 3 (4) | 1 (2 3 4)' },
  { id: 'r-rests', title: 'Rests', level: 'beginner', time: '4/4', bpm: 72, r: 'q r:q q r:q | h r:h | q q r:q q | w', count: 'Say "rest" on the silent beats.' },
  { id: 'r-three', title: 'Three beats', level: 'beginner', time: '3/4', bpm: 80, r: 'q q q | h q | q h | h.', count: '1 2 3 | 1 (2) 3 | 1 2 (3) | 1 (2 3)' },
  { id: 'r-quavers', title: 'Quavers', level: 'beginner', time: '4/4', bpm: 70, r: '8 8 q 8 8 q | q 8 8 h | 8 8 8 8 q q | w', count: '1 & 2 3 & 4 | 1 2 & 3 (4) | 1 & 2 & 3 4 | 1' },
  { id: 'r-quaver-rests', title: 'Quavers and rests', level: 'beginner', time: '4/4', bpm: 70, r: 'q 8 8 r:q q | 8 8 r:q 8 8 q | h 8 8 q | w', count: '1 2 & (3) 4 | 1 & (2) 3 & 4 | 1 (2) 3 & 4 | 1' },
  { id: 'r-dotted-minims', title: 'Dotted minims', level: 'beginner', time: '3/4', bpm: 84, r: 'h. | q q q | h q | h.', count: '1 (2 3) | 1 2 3 | 1 (2) 3 | 1 (2 3)' },
  { id: 'r-dotted-crotchets', title: 'Dotted crotchets', level: 'intermediate', time: '4/4', bpm: 70, r: 'q. 8 q q | q. 8 h | q q q. 8 | w', count: '1 (2) & 3 4 | 1 (2) & 3 | 1 2 3 (4) & | 1' },
  { id: 'r-ties', title: 'Ties across the beat', level: 'intermediate', time: '4/4', bpm: 70, r: 'q h~ 8 8 | h~ q q | q q~ q q | w', count: 'Hold through the tie; only the first note of a tie is played.' },
  { id: 'r-syncopation', title: 'Syncopation', level: 'intermediate', time: '4/4', bpm: 66, r: '8 q 8 q q | 8 q 8 h | 8 q q 8 q | w', count: '1 & (2) & 3 4 | 1 & (2) & 3 | 1 & (2) & (3) & 4 | 1' },
  { id: 'r-six-eight', title: 'Six-eight', level: 'intermediate', time: '6/8', bpm: 50, r: 'q 8 q 8 | q. q. | 8 8 8 q 8 | h.', count: 'Count 1 2 3 4 5 6, with weight on 1 and 4.' },
  { id: 'r-pickup', title: 'Pickup bar', level: 'intermediate', time: '4/4', bpm: 76, r: 'q | q q q q | h. q | q q h | h.', count: 'Start on beat 4: the first bar is incomplete.' },
  { id: 'r-semiquavers', title: 'Semiquavers', level: 'advanced', time: '4/4', bpm: 60, r: '16 16 16 16 q 16 16 16 16 q | 8 16 16 q 16 16 8 q | 16 16 16 16 16 16 16 16 h | w', count: '1 e & a 2 3 e & a 4' },
  { id: 'r-dotted-quavers', title: 'Dotted quaver and semiquaver', level: 'advanced', time: '4/4', bpm: 60, r: '8. 16 8. 16 q q | 8. 16 q h | q 8. 16 8. 16 q | w', count: '1 (e &) a 2 (e &) a 3 4' },
  { id: 'r-triplets', title: 'Triplets', level: 'advanced', time: '4/4', bpm: 66, r: '8t 8t 8t q 8t 8t 8t q | q 8t 8t 8t h | 8t 8t 8t 8t 8t 8t q q | w', count: '1 trip let 2 3 trip let 4' },
  { id: 'r-waltz-sync', title: 'Syncopated waltz', level: 'advanced', time: '3/4', bpm: 80, r: '8 q 8 q | q. 8 q | 8 8 q 8 8 | h.', count: '1 & (2) & 3 | 1 (2) & 3 | 1 & 2 3 & | 1' },
  { id: 'r-offbeat-rests', title: 'Rests on the beat', level: 'advanced', time: '4/4', bpm: 66, r: 'r:8 8 r:8 8 q q | r:q 8 8 r:8 8 q | r:8 8 8 8 r:h | w', count: 'Feel the rest on the beat, then play on the "and".' }
];
function rhythmMusic(r) {
  return r.split('|').map(bar => bar.trim().split(/\s+/).filter(Boolean).map(tok => tok.startsWith('r:') ? tok : 'b4:' + tok).join(' ')).join(' | ');
}

/* ---------------- Pieces for sight-reading play-along ----------------
   Public-domain and traditional tunes, plus original studies. */
const PIECE_LEVELS = [
  { n: 1, name: 'Right hand', desc: 'Treble clef, mostly in C position' },
  { n: 2, name: 'Left hand', desc: 'Bass clef melodies' },
  { n: 3, name: 'Taking turns', desc: 'Grand stave, one hand at a time' },
  { n: 4, name: 'Hands together: first steps', desc: 'A melody over long bass notes and chords' },
  { n: 5, name: 'Hands together: both moving', desc: 'Both hands play on most beats: parallel, contrary and rounds' },
  { n: 6, name: 'Hands together: accompaniments', desc: 'Waltz bass, oom-pah, broken chords and Alberti bass' },
  { n: 7, name: 'Stretch', desc: 'Ledger lines, key signatures and quicker rhythms, hands together' },
  { n: 8, name: 'Chords in the right hand', desc: 'Right-hand chords and octaves over a moving left hand' },
  { n: 9, name: 'Melody and accompaniment', desc: 'Right-hand tunes over left-hand chords, bass lines and broken chords' },
  { n: 10, name: 'Advanced pieces', desc: 'Longer, harder pieces: quick runs, busy left hands, sharps, flats and triplets' }
];
const PIECES = [
  { id: 'p-five-finger', level: 1, title: 'Five-finger warm-up', by: 'Study', clef: 'treble', time: '4/4', bpm: 80,
    music: 'c4:q@1 d4@2 e4@3 f4@4 | g4:w@5 | g4:q f4 e4 d4 | c4:w FIN' },
  { id: 'p-ode', level: 1, title: 'Ode to Joy', by: 'Beethoven', clef: 'treble', time: '4/4', bpm: 92,
    music: 'e4:q e4 f4 g4 | g4 f4 e4 d4 | c4 c4 d4 e4 | e4:q. d4:8 d4:h | e4:q e4 f4 g4 | g4 f4 e4 d4 | c4 c4 d4 e4 | d4:q. c4:8 c4:h FIN' },
  { id: 'p-mary', level: 1, title: 'Mary Had a Little Lamb', by: 'Traditional', clef: 'treble', time: '4/4', bpm: 96,
    music: 'e4:q d4 c4 d4 | e4 e4 e4:h | d4:q d4 d4:h | e4:q g4 g4:h | e4:q d4 c4 d4 | e4 e4 e4 e4 | d4 d4 e4 d4 | c4:w FIN' },
  { id: 'p-clair', level: 1, title: 'Au clair de la lune', by: 'Traditional', clef: 'treble', time: '4/4', bpm: 88,
    music: 'c4:q c4 c4 d4 | e4:h d4 | c4:q e4 d4 d4 | c4:w | c4:q c4 c4 d4 | e4:h d4 | c4:q e4 d4 d4 | c4:w FIN' },
  { id: 'p-twinkle', level: 1, title: 'Twinkle, Twinkle, Little Star', by: 'Traditional', clef: 'treble', time: '4/4', bpm: 96,
    music: 'c4:q c4 g4 g4 | a4 a4 g4:h | f4:q f4 e4 e4 | d4 d4 c4:h | g4:q g4 f4 f4 | e4 e4 d4:h | g4:q g4 f4 f4 | e4 e4 d4:h | c4:q c4 g4 g4 | a4 a4 g4:h | f4:q f4 e4 e4 | d4 d4 c4:h FIN' },
  { id: 'p-buns', level: 1, title: 'Hot Cross Buns', by: 'Traditional', clef: 'treble', time: '4/4', bpm: 88,
    music: 'e4:q d4 c4:h | e4:q d4 c4:h | c4:8 c4 c4 c4 d4 d4 d4 d4 | e4:q d4 c4:h FIN' },
  { id: 'p-five-finger-lh', level: 2, title: 'Left-hand warm-up', by: 'Study', clef: 'bass', time: '4/4', bpm: 80,
    music: 'c3:q@5 d3@4 e3@3 f3@2 | g3:w@1 | g3:q f3 e3 d3 | c3:w FIN' },
  { id: 'p-ode-lh', level: 2, title: 'Ode to Joy (left hand)', by: 'Beethoven', clef: 'bass', time: '4/4', bpm: 88,
    music: 'e3:q e3 f3 g3 | g3 f3 e3 d3 | c3 c3 d3 e3 | e3:q. d3:8 d3:h | e3:q e3 f3 g3 | g3 f3 e3 d3 | c3 c3 d3 e3 | d3:q. c3:8 c3:h FIN' },
  { id: 'p-frere', level: 2, title: 'Frère Jacques', by: 'Traditional', clef: 'bass', time: '4/4', bpm: 92,
    music: 'c3:q d3 e3 c3 | c3 d3 e3 c3 | e3 f3 g3:h | e3:q f3 g3:h | g3:8 a3 g3 f3 e3:q c3 | g3:8 a3 g3 f3 e3:q c3 | c3 g2 c3:h | c3:q g2 c3:h FIN' },
  { id: 'p-g-position', level: 2, title: 'Down in the bass', by: 'Study', clef: 'bass', time: '4/4', bpm: 84,
    music: 'g2:q a2 b2 c3 | d3:h b2 | c3:q b2 a2 g2 | a2:w | g2:q b2 d3 b2 | c3:h a2 | b2:q a2 b2 c3 | g2:w FIN' },
  { id: 'p-canon-bass', level: 2, title: 'Canon bass line', by: 'Pachelbel', clef: 'bass', key: 'D', time: '4/4', bpm: 72,
    music: 'd3:h a2 | b2 f#2 | g2 d2 | g2 a2 | d3:h a2 | b2 f#2 | g2 d2 | g2 a2 FIN' },
  { id: 'p-call', level: 3, title: 'Call and answer', by: 'Study', clef: 'grand', time: '4/4', bpm: 84,
    rh: 'c5:q b4 a4 g4 | a4:h g4 | r:w | r:w | e5:q d5 c5 b4 | c5:w | r:w | r:w FIN',
    lh: 'r:w | r:w | c3:q d3 e3 f3 | g3:h c3 | r:w | r:w | g2:q a2 b2 d3 | c3:w FIN' },
  { id: 'p-ode-turns', level: 3, title: 'Ode to Joy, taking turns', by: 'Beethoven', clef: 'grand', time: '4/4', bpm: 88,
    rh: 'e4:q e4 f4 g4 | g4 f4 e4 d4 | c4 c4 d4 e4 | e4:q. d4:8 d4:h | r:w | r:w | r:w | r:w FIN',
    lh: 'r:w | r:w | r:w | r:w | e3:q e3 f3 g3 | g3 f3 e3 d3 | c3 c3 d3 e3 | d3:q. c3:8 c3:h FIN' },
  { id: 'p-saints', level: 3, title: 'When the Saints', by: 'Traditional', clef: 'grand', time: '4/4', bpm: 100,
    rh: 'r:q c4 e4 f4 | g4:w | r:q c4 e4 f4 | g4:w | r:q c4 e4 f4 | g4:h e4 | c4:h e4 | d4:w FIN',
    lh: 'r:w | r:q c3 e3 g3 | r:w | r:q c3 e3 g3 | r:w | r:w | r:w | g2:w FIN' },
  { id: 'p-steps-skips', level: 3, title: 'Steps and skips', by: 'Study', clef: 'grand', time: '3/4', bpm: 96,
    rh: 'e4:q f4 g4 | e4:h. | r:h. | r:h. | g4:q e4 c4 | d4:h. | r:h. | r:h. FIN',
    lh: 'r:h. | r:h. | c3:q e3 g3 | c3:h. | r:h. | r:h. | g2:q b2 d3 | c3:h. FIN' },
  { id: 'p-ode-hands', level: 4, title: 'Ode to Joy, hands together', by: 'Beethoven', clef: 'grand', time: '4/4', bpm: 80,
    rh: 'e4:q e4 f4 g4 | g4 f4 e4 d4 | c4 c4 d4 e4 | e4:q. d4:8 d4:h | e4:q e4 f4 g4 | g4 f4 e4 d4 | c4 c4 d4 e4 | d4:q. c4:8 c4:h FIN',
    lh: 'c3:w | g2:w | c3:w | g2:w | c3:w | g2:w | c3:w | g2:h c3:h FIN' },
  { id: 'p-c-scale', level: 4, title: 'C major scale, hands together', by: 'Study', clef: 'grand', time: '4/4', bpm: 72,
    rh: 'c4:q@1 d4@2 e4@3 f4@1 | g4@2 a4@3 b4@4 c5@5 | c5 b4 a4 g4 | f4 e4 d4 c4 FIN',
    lh: 'c3:q@5 d3@4 e3@3 f3@2 | g3@1 a3@3 b3@2 c4@1 | c4 b3 a3 g3 | f3 e3 d3 c3 FIN' },
  { id: 'p-chord-walk', level: 4, title: 'Chord walk', by: 'Study', clef: 'grand', time: '4/4', bpm: 76,
    rh: 'e4:q g4 e4 c4 | f4 a4 f4 c4 | d4 g4 b4 g4 | c5:w FIN',
    lh: '(c3 e3 g3):w | (f2 a2 c3):w | (g2 b2 d3):w | (c3 e3 g3):w FIN' },
  { id: 'p-minuet', level: 4, title: 'Minuet in G (simplified)', by: 'Petzold', clef: 'grand', key: 'G', time: '3/4', bpm: 92,
    rh: 'd5:q g4:8 a4 b4 c5 | d5:q g4 g4 | e5:q c5:8 d5 e5 f#5 | g5:q g4 g4 | c5:q d5:8 c5 b4 a4 | b4:q c5:8 b4 a4 g4 | f#4:q g4:8 a4 b4 g4 | a4:h. FIN',
    lh: 'g3:h. | b2:h. | c3:h. | b2:h. | a2:h. | g2:h. | d3:h. | d3:h. FIN' },
  { id: 'p-canon', level: 5, title: 'Canon in D (theme)', by: 'Pachelbel', clef: 'grand', key: 'D', time: '4/4', bpm: 66,
    rh: 'f#5:h e5 | d5 c#5 | b4 a4 | b4 c#5 | d5 c#5 | b4 a4 | g4 f#4 | g4 e4 FIN',
    lh: 'd3:h a2 | b2 f#2 | g2 d2 | g2 a2 | d3:h a2 | b2 f#2 | g2 d2 | g2 a2 FIN' },
  { id: 'p-amazing', level: 4, title: 'Amazing Grace', by: 'Traditional', clef: 'grand', key: 'G', time: '3/4', bpm: 80,
    rh: 'd4:q | g4:h b4:8 g4 | b4:h a4:q | g4:h e4:q | d4:h d4:q | g4:h b4:8 g4 | b4:h a4:q | d5:h. FIN',
    lh: 'r:q | g2:h. | g2:h. | c3:h. | g2:h. | g2:h. | g2:h. | d3:h. FIN' },

  /* ---------- Both hands moving ---------- */
  { id: 'p-mirror', level: 5, title: 'Mirror steps', by: 'Study', clef: 'grand', time: '4/4', bpm: 72,
    rh: 'c4:q@1 d4 e4 f4 | g4:w@5 | g4:q f4 e4 d4 | c4:w FIN',
    lh: 'c3:q@1 b2 a2 g2 | f2:w@5 | f2:q g2 a2 b2 | c3:w FIN' },
  { id: 'p-octave-walk', level: 5, title: 'Octave walk', by: 'Study', clef: 'grand', time: '4/4', bpm: 76,
    rh: 'c4:q d4 e4 f4 | g4 f4 e4 d4 | e4 f4 g4:h | c4:w FIN',
    lh: 'c3:q d3 e3 f3 | g3 f3 e3 d3 | e3 f3 g3:h | c3:w FIN' },
  { id: 'p-c-contrary', level: 5, title: 'C major scale in contrary motion', by: 'Study', clef: 'grand', time: '4/4', bpm: 66,
    rh: 'c4:q@1 d4@2 e4@3 f4@1 | g4@2 a4@3 b4@4 c5@5 | c5 b4 a4 g4 | f4 e4 d4 c4 FIN',
    lh: 'c4:q@1 b3@2 a3@3 g3@1 | f3@2 e3@3 d3@4 c3@5 | c3 d3 e3 f3 | g3 a3 b3 c4 FIN' },
  { id: 'p-ode-moving', level: 5, title: 'Ode to Joy, moving bass', by: 'Beethoven', clef: 'grand', time: '4/4', bpm: 76,
    rh: 'e4:q e4 f4 g4 | g4 f4 e4 d4 | c4 c4 d4 e4 | e4:q. d4:8 d4:h | e4:q e4 f4 g4 | g4 f4 e4 d4 | c4 c4 d4 e4 | d4:q. c4:8 c4:h FIN',
    lh: 'c3:h e3 | g2:h b2 | c3:h e3 | g2:h g2 | c3:h e3 | g2:h b2 | c3:h e3 | g2:h c3 FIN' },
  { id: 'p-lightly-row', level: 5, title: 'Lightly Row', by: 'Traditional', clef: 'grand', time: '4/4', bpm: 84,
    rh: 'g4:q e4 e4:h | f4:q d4 d4:h | c4:q d4 e4 f4 | g4 g4 g4:h | g4:q e4 e4:h | f4:q d4 d4:h | c4:q e4 g4 g4 | c4:w FIN',
    lh: 'c3:h e3 | b2:h g2 | c3:h e3 | c3:h e3 | c3:h e3 | b2:h g2 | c3:h e3 | c3:w FIN' },
  { id: 'p-tenths-waltz', level: 5, title: 'Tenths waltz', by: 'Study', clef: 'grand', time: '3/4', bpm: 92,
    rh: 'e4:q f4 g4 | a4:h g4:q | f4 e4 d4 | e4:h. | e4:q f4 g4 | a4:h f4:q | e4 d4 b3 | c4:h. FIN',
    lh: 'c3:q d3 e3 | f3:h e3:q | d3 c3 b2 | c3:h. | c3:q d3 e3 | f3:h d3:q | c3 b2 g2 | c3:h. FIN' },
  { id: 'p-frere-round', level: 5, title: 'Frère Jacques, as a round', by: 'Traditional', clef: 'grand', time: '4/4', bpm: 84,
    rh: 'c4:q d4 e4 c4 | c4 d4 e4 c4 | e4 f4 g4:h | e4:q f4 g4:h | g4:8 a4 g4 f4 e4:q c4 | g4:8 a4 g4 f4 e4:q c4 | c4 g3 c4:h | c4:q g3 c4:h | e4:w | e4:w FIN',
    lh: 'r:w | r:w | c3:q d3 e3 c3 | c3 d3 e3 c3 | e3 f3 g3:h | e3:q f3 g3:h | g3:8 a3 g3 f3 e3:q c3 | g3:8 a3 g3 f3 e3:q c3 | c3:q g2 c3:h | c3:q g2 c3:h FIN' },
  { id: 'p-jingle', level: 5, title: 'Jingle Bells (chorus)', by: 'Pierpont', clef: 'grand', time: '4/4', bpm: 100,
    rh: 'e4:q e4 e4:h | e4:q e4 e4:h | e4:q g4 c4:q. d4:8 | e4:w | f4:q f4 f4:q. f4:8 | f4:q e4 e4 e4:8 e4 | e4:q d4 d4 e4 | d4:h g4:h | e4:q e4 e4:h | e4:q e4 e4:h | e4:q g4 c4:q. d4:8 | e4:w | f4:q f4 f4:q. f4:8 | f4:q e4 e4 e4:8 e4 | g4:q g4 f4 d4 | c4:w FIN',
    lh: 'c3:h g2 | c3:h g2 | c3:h g2 | c3:h e3 | f2:h a2 | c3:h g2 | g2:h b2 | g2:h b2 | c3:h g2 | c3:h g2 | c3:h g2 | c3:h e3 | f2:h a2 | c3:h g2 | g2:h b2 | c3:w FIN' },
  /* ---------- Accompaniment patterns ---------- */
  { id: 'p-little-march', level: 6, title: 'Little march (oom-pah)', by: 'Study', clef: 'grand', time: '4/4', bpm: 88,
    rh: 'e4:q g4 e4 c4 | d4 f4 d4 b3 | c4 e4 g4 e4 | c4:h r:h FIN',
    lh: 'c3:q (e3 g3) g2 (e3 g3) | g2 (b2 f3) d3 (b2 f3) | c3 (e3 g3) g2 (e3 g3) | c3:h r:h FIN' },
  { id: 'p-twinkle-broken', level: 6, title: 'Twinkle with broken chords', by: 'Traditional', clef: 'grand', time: '4/4', bpm: 80,
    rh: 'c4:q c4 g4 g4 | a4 a4 g4:h | f4:q f4 e4 e4 | d4 d4 c4:h FIN',
    lh: 'c3:q e3 g3 e3 | f3:q a3 c3:h | f2:q a2 c3 g2 | g2:q b2 c3:h FIN' },
  { id: 'p-amazing-waltz', level: 6, title: 'Amazing Grace, waltz bass', by: 'Traditional', clef: 'grand', key: 'G', time: '3/4', bpm: 80,
    rh: 'd4:q | g4:h b4:8 g4 | b4:h a4:q | g4:h e4:q | d4:h d4:q | g4:h b4:8 g4 | b4:h a4:q | d5:h. FIN',
    lh: 'r:q | g2:q (b2 d3) (b2 d3) | g2 (b2 d3) (b2 d3) | c3 (e3 g3) (e3 g3) | g2 (b2 d3) (b2 d3) | g2 (b2 d3) (b2 d3) | g2 (b2 d3) (b2 d3) | (d3 f#3 a3):h. FIN' },
  { id: 'p-alberti', level: 6, title: 'Alberti bass in C', by: 'Study', clef: 'grand', time: '4/4', bpm: 72,
    rh: 'e4:h g4 | f4:q d4 e4:h | f4:h a4 | d4:q f4 e4:h FIN',
    lh: 'c3:8 g3 e3 g3 c3 g3 e3 g3 | b2 g3 d3 g3 c3 g3 e3 g3 | c3 a3 f3 a3 c3 a3 f3 a3 | b2 g3 d3 g3 c3 g3 e3 g3 FIN' },
  { id: 'p-prelude-hands', level: 7, title: 'Prelude in C, hands together (simplified)', by: 'J. S. Bach', clef: 'grand', time: '4/4', bpm: 56,
    rh: 'e4:16 g4 c5 e5 g4 c5 e5 g4 e4 g4 c5 e5 g4 c5 e5 g4 | d4 a4 d5 f5 a4 d5 f5 a4 d4 a4 d5 f5 a4 d5 f5 a4 | d4 g4 d5 f5 g4 d5 f5 g4 d4 g4 d5 f5 g4 d5 f5 g4 | e4 g4 c5 e5 g4 c5 e5 g4 e4 g4 c5 e5 g4 c5 e5 g4 FIN',
    lh: 'c3:w | c3:w | b2:w | c3:w FIN' },

  /* ---------- Chords in the right hand, bass line in the left ---------- */
  { id: 'p-block-chords', level: 8, title: 'Block chords in C', by: 'Study', clef: 'grand', time: '4/4', bpm: 72,
    rh: '(c4 e4 g4):h (c4 e4 g4) | (c4 f4 a4):h (c4 f4 a4) | (b3 d4 g4):h (b3 d4 g4) | (c4 e4 g4):w FIN',
    lh: 'c3:q d3 e3 c3 | f2:q g2 a2 f2 | g2:q a2 b2 g2 | c3:w FIN' },
  { id: 'p-lament', level: 8, title: 'Lament in A minor', by: 'Study', clef: 'grand', key: 'Am', time: '4/4', bpm: 66,
    rh: '(c4 e4 a4):h (c4 e4 a4) | (c4 f4 a4):h (b3 e4 g#4) | (c4 e4 a4):h (c4 e4 g4) | (c4 f4 a4):h (d4 f4 a4) | (b3 e4 g#4):h (b3 d4 g#4) | (c4 e4 a4):w FIN',
    lh: 'a2:h g2 | f2:h e2 | a2:h g2 | f2:h d2 | e2:h e2 | a2:w FIN' },
  { id: 'p-pop-chords', level: 8, title: 'Four-chord pop', by: 'Study', clef: 'grand', time: '4/4', bpm: 84,
    rh: '(e4 g4 c5):q. (e4 g4 c5):8 (e4 g4 c5):h | (d4 g4 b4):q. (d4 g4 b4):8 (d4 g4 b4):h | (e4 a4 c5):q. (e4 a4 c5):8 (e4 a4 c5):h | (f4 a4 c5):q. (f4 a4 c5):8 (f4 a4 c5):h | (e4 g4 c5):q. (e4 g4 c5):8 (e4 g4 c5):h | (d4 g4 b4):q. (d4 g4 b4):8 (d4 g4 b4):h | (e4 a4 c5):q. (e4 a4 c5):8 (e4 a4 c5):h | (f4 a4 c5):h (d4 g4 b4):h | (e4 g4 c5):w FIN',
    lh: 'c3:8 c3 c3 c3 c3 c3 c3 c3 | g2 g2 g2 g2 g2 g2 g2 g2 | a2 a2 a2 a2 a2 a2 a2 a2 | f2 f2 f2 f2 f2 f2 f2 f2 | c3 c4 c3 c4 c3 c4 c3 c4 | g2 g3 g2 g3 g2 g3 g2 g3 | a2 a3 a2 a3 a2 a3 a2 a3 | f2 f3 f2 f3 g2 g3 g2 g3 | c3:w FIN' },
  { id: 'p-evening-hymn', level: 8, title: 'Evening hymn', by: 'Study', clef: 'grand', key: 'G', time: '4/4', bpm: 69,
    rh: '(d4 g4 b4):q (d4 f#4 a4) (b3 e4 g4) (c4 e4 g4) | (d4 f#4 a4) (d4 g4 b4) (d4 f#4 a4):h | (d4 g4 b4):q (e4 g4 c5) (g4 b4 d5) (e4 g4 b4) | (c4 e4 a4) (d4 f#4 a4) (b3 d4 g4):h | (g4 b4 d5):q (e4 g4 b4) (e4 g4 c5) (c4 e4 a4) | (d4 g4 b4) (b3 e4 g4) (d4 f#4 a4):h | (d4 g4 b4):q (e4 g4 c5) (c4 f#4 a4):h | (b3 d4 g4):w FIN',
    lh: 'g2:q f#2 e2 c3 | d3 b2 d3:h | g2:q c3 b2 e3 | c3 d3 g2:h | b2:q e3 c3 a2 | b2 e3 d3:h | g2:q a2 d3:h | g2:w FIN' },
  { id: 'p-walking-g', level: 8, title: 'Walking bass in G', by: 'Study', clef: 'grand', key: 'G', time: '4/4', bpm: 88,
    rh: '(b3 d4 g4):h (b3 d4 g4) | (b3 e4 g4):h (b3 e4 g4) | (c4 e4 a4):h (c4 e4 a4) | (c4 f#4 a4):h (c4 f#4 a4) | (b3 d4 g4):h (b3 d4 g4) | (c4 e4 g4):h (c4 e4 g4) | (c4 f#4 a4):h (c4 f#4 a4) | (b3 d4 g4):w FIN',
    lh: 'g2:q a2 b2 d3 | e2 f#2 g2 b2 | a2 b2 c3 e3 | d3 c3 b2 a2 | g2 a2 b2 g2 | c3 d3 e3 c3 | d3 e3 f#3 d3 | g2:w FIN' },
  { id: 'p-blues-c', level: 8, title: 'Twelve-bar blues in C', by: 'Study', clef: 'grand', time: '4/4', bpm: 96,
    rh: 'r:q (e4 g4 bb4) r:q (e4 g4 bb4) | r:q (e4 g4 bb4) r:q (e4 g4 bb4) | r:q (e4 g4 bb4) r:q (e4 g4 bb4) | r:q (e4 g4 bb4) r:q (e4 g4 bb4) | r:q (eb4 a4 c5) r:q (eb4 a4 c5) | r:q (eb4 a4 c5) r:q (eb4 a4 c5) | r:q (e4 g4 bb4) r:q (e4 g4 bb4) | r:q (e4 g4 bb4) r:q (e4 g4 bb4) | r:q (d4 f4 b4) r:q (d4 f4 b4) | r:q (eb4 a4 c5) r:q (eb4 a4 c5) | r:q (e4 g4 bb4) r:q (e4 g4 bb4) | r:q (d4 f4 b4) r:q (d4 f4 b4) | (e4 g4 bb4 c5):w FIN',
    lh: 'c3:8 e3 g3 a3 bb3 a3 g3 e3 | c3 e3 g3 a3 bb3 a3 g3 e3 | c3 e3 g3 a3 bb3 a3 g3 e3 | c3 e3 g3 a3 bb3 a3 g3 e3 | f2 a2 c3 d3 eb3 d3 c3 a2 | f2 a2 c3 d3 eb3 d3 c3 a2 | c3 e3 g3 a3 bb3 a3 g3 e3 | c3 e3 g3 a3 bb3 a3 g3 e3 | g2 b2 d3 e3 f3 e3 d3 b2 | f2 a2 c3 d3 eb3 d3 c3 a2 | c3 e3 g3 a3 bb3 a3 g3 e3 | g2 b2 d3 e3 f3 e3 d3 b2 | (c2 c3):w FIN' },
  { id: 'p-ragtime', level: 8, title: 'Ragtime strut', by: 'Study', clef: 'grand', time: '4/4', bpm: 84,
    rh: '(e4 g4 c5):8 (e4 g4 c5):q (e4 g4 c5):8 (e4 g4 c5):h | (e4 g4 c#5):8 (e4 g4 c#5):q (e4 g4 c#5):8 (e4 g4 c#5):h | (f#4 a4 c5):8 (f#4 a4 c5):q (f#4 a4 c5):8 (f#4 a4 c5):h | (f4 g4 b4):8 (f4 g4 b4):q (f4 g4 b4):8 (f4 g4 b4):h | (e4 g4 c5):8 (e4 g4 d5):q (e4 g4 e5):8 (e4 g4 c5):h | (f4 a4 c5):8 (f4 a4 d5):q (f4 a4 c5):8 (f4 a4 c5):h | (f4 g4 b4):8 (f4 g4 b4):q (f4 g4 d5):8 (f4 g4 b4):h | (e4 g4 c5):q r:q (c4 e4 g4 c5):q r:q FIN',
    lh: 'c3:q (e3 g3) g2 (e3 g3) | a2 (c#3 g3) e2 (c#3 g3) | d3 (f#3 a3) a2 (f#3 a3) | g2 (b2 f3) d3 (b2 f3) | c3 (e3 g3) g2 (e3 g3) | f2 (a2 c3) f2 (a2 c3) | g2 (b2 f3) d3 (b2 f3) | c3:q r:q (c2 c3):q r:q FIN' },
  /* ---------- Melody over left-hand chords ---------- */
  { id: 'p-melody-blocks', level: 9, title: 'Melody over block chords', by: 'Study', clef: 'grand', time: '4/4', bpm: 76,
    rh: 'e4:q f4 g4 e4 | f4 g4 a4 f4 | d4 e4 f4 d4 | e4:w | e4:q f4 g4 c5 | a4 g4 f4 a4 | g4 f4 d4 b3 | c4:w FIN',
    lh: '(c3 e3 g3):w | (c3 f3 a3):w | (b2 d3 g3):w | (c3 e3 g3):w | (c3 e3 g3):w | (c3 f3 a3):w | (b2 f3 g3):w | (c3 e3 g3):w FIN' },
  { id: 'p-auld-lang-syne', level: 9, title: 'Auld Lang Syne', by: 'Traditional', clef: 'grand', key: 'F', time: '4/4', bpm: 72,
    rh: 'c4:q | f4:q. f4:8 f4:q a4 | g4:q. f4:8 g4:q a4 | f4:q. f4:8 a4:q c5 | d5:h. d5:q | c5:q. a4:8 a4:q f4 | g4:q. f4:8 g4:q a4 | f4:q. d4:8 d4:q c4 | f4:h. FIN',
    lh: 'r:q | (a2 c3 f3):h (a2 c3 f3) | (g2 c3 e3):h (g2 c3 e3) | (a2 c3 f3):h (a2 c3 f3) | (bb2 d3 f3):h (bb2 d3 f3) | (a2 c3 f3):h (a2 c3 f3) | (g2 c3 e3):h (g2 c3 e3) | (bb2 d3 f3):h (g2 bb2 e3) | (a2 c3 f3):h. FIN' },
  { id: 'p-sunday-waltz', level: 9, title: 'Sunday waltz', by: 'Study', clef: 'grand', key: 'F', time: '3/4', bpm: 100,
    rh: 'a4:h c5:q | d5:h bb4:q | a4:q c5 a4 | g4:h. | g4:h bb4:q | a4:h f4:q | e4:q g4 bb4 | f4:h. FIN',
    lh: 'f2:q (a2 c3) (a2 c3) | bb2 (d3 f3) (d3 f3) | f2 (a2 c3) (a2 c3) | c3 (e3 bb3) (e3 bb3) | c3 (e3 bb3) (e3 bb3) | f2 (a2 c3) (a2 c3) | c3 (e3 bb3) (e3 bb3) | f2:q (a2 c3):h FIN' },
  { id: 'p-ballad', level: 9, title: 'Rainy-day ballad', by: 'Study', clef: 'grand', key: 'Am', time: '4/4', bpm: 72,
    rh: 'e4:q a4 b4 c5 | c5:q. b4:8 a4:h | g4:q e4 g4 c5 | d5:h b4:h | a4:q b4 c5 e5 | d5:q. c5:8 a4:h | b4:q d5 g4 b4 | a4:w FIN',
    lh: 'a2:8 e3 a3 c4 a3 e3 a3 e3 | f2 c3 f3 a3 f3 c3 f3 c3 | c2 g2 c3 e3 c3 g2 c3 g2 | g2 d3 g3 b3 g3 d3 g3 d3 | a2 e3 a3 c4 a3 e3 a3 e3 | f2 c3 f3 a3 f3 c3 f3 c3 | g2 d3 g3 b3 g3 d3 g3 d3 | (a2 e3 a3):w FIN' },
  { id: 'p-gymnopedie', level: 9, title: 'Gymnopédie No. 1 (opening)', by: 'Satie', clef: 'grand', key: 'D', time: '3/4', bpm: 66,
    rh: 'r:h. | r:h. | r:q f#5 a5 | g5 f#5 c#5 | b4 c#5 d5 | a4:h. | f#4:h.~ | f#4:h. FIN',
    lh: 'g2:q (b3 d4 f#4):h | d2:q (a3 c#4 f#4):h | g2:q (b3 d4 f#4):h | d2:q (a3 c#4 f#4):h | g2:q (b3 d4 f#4):h | d2:q (a3 c#4 f#4):h | g2:q (b3 d4 f#4):h | d2:q (a3 c#4 f#4):h FIN' },
  /* ---------- Concert pieces ---------- */
  { id: 'p-song-without-words', level: 10, title: 'Song without words', by: 'Study', clef: 'grand', key: 'D', time: '4/4', bpm: 63,
    rh: '(f#4 a4):h (e4 g4):q (f#4 a4) | (f#4 b4):h. (b4 d5):q | (b4 d5):q. (a4 c#5):8 (g4 b4):q (d4 g4) | (e4 a4):w | (f#4 a4):h (d4 f#4):q (f#4 a4) | (b4 d5):h (g4 b4):q (d4 g4) | (e4 a4):q (e4 g4) (c#4 e4) (a3 c#4) | (d4 f#4 a4):w FIN',
    lh: 'd2:8 a2 d3 f#3 a3 f#3 d3 a2 | b2 f#3 b3 d4 b3 f#3 d3 f#3 | g2 d3 g3 b3 g3 d3 b2 d3 | a2 e3 a3 c#4 a3 e3 c#3 e3 | d2 a2 d3 f#3 a3 f#3 d3 a2 | g2 d3 g3 b3 g3 d3 b2 d3 | a2 e3 g3 c#4 g3 e3 c#3 e3 | (d2 a2 d3):w FIN' },
  { id: 'p-etude-am', level: 10, title: 'Étude in A minor', by: 'Study', clef: 'grand', key: 'Am', time: '4/4', bpm: 66,
    rh: 'a4:16 b4 c5 d5 e5 d5 c5 b4 c5 d5 e5 f5 e5 d5 c5 b4 | d5 c5 b4 a4 f4 a4 d5 f5 e5 d5 c5 b4 a4 b4 c5 d5 | e5 d5 c5 b4 g#4 a4 b4 c5 d5 c5 b4 a4 g#4 a4 b4 g#4 | a4:q e4 a4:h | c5:16 d5 e5 f5 a5 f5 e5 d5 c5 a4 f4 a4 c5 f5 e5 d5 | d5 e5 f5 e5 d5 a4 f4 a4 d5 f5 a5 f5 d5 c5 b4 a4 | g#4 a4 b4 c5 d5 c5 b4 a4 g#4 b4 d5 e5 d5 b4 g#4 e4 | (c5 e5 a5):w FIN',
    lh: 'a2:q (c3 e3) a2 (c3 e3) | d3 (f3 a3) d3 (f3 a3) | e2 (g#2 b2 d3) e2 (g#2 b2 d3) | a2:q e2 a2:h | f2:q (a2 c3) f2 (a2 c3) | d3 (f3 a3) d3 (f3 a3) | e2 (g#2 b2 d3) e2 (g#2 b2 d3) | (a2 e3 a3):w FIN' },
  { id: 'p-invention', level: 10, title: 'Two-part invention study', by: 'Study', clef: 'grand', time: '4/4', bpm: 69,
    rh: 'c5:8 d5 e5 f5 d5 e5 c5:q | g5:q c5 b4 c5 | g4:8 a4 b4 c5 a4 b4 g4:q | e5:q d5 c5 b4 | a4:8 b4 c5 d5 b4 c5 a4:q | d5:8 e5 f5 g5 e5 f5 d5:q | e5:q d5:8 c5 b4:q g4 | c5:w FIN',
    lh: 'c3:w | c3:8 d3 e3 f3 d3 e3 c3:q | g2:q d3 d3 b2 | g2:8 a2 b2 c3 a2 b2 g2:q | f2:q f3 e3 f3 | b2:q g2 c3 b2 | c3:q f3 g3 g2 | c3:w FIN' },
  { id: 'p-nocturne', level: 10, title: 'Nocturne in E♭', by: 'Study', clef: 'grand', key: 'Eb', time: '6/8', bpm: 50,
    rh: 'g4:q. bb4:q eb5:8 | eb5:q. c5:q ab4:8 | bb4:q. ab4:q f4:8 | g4:h. | g4:q. c5:q eb5:8 | f5:q. eb5:q c5:8 | d5:q c5:8 bb4:q ab4:8 | g4:h. | c5:q. eb5:q ab5:8 | g5:q. f5:q eb5:8 | f5:q. d5:q bb4:8 | (g4 bb4 eb5):h. FIN',
    lh: 'eb2:8 bb2 g3 bb3 g3 bb2 | ab2 eb3 ab3 c4 ab3 eb3 | bb1 f2 d3 ab3 d3 f2 | eb2 bb2 g3 bb3 g3 bb2 | c2 g2 eb3 g3 eb3 g2 | ab2 eb3 ab3 c4 ab3 eb3 | bb1 f2 d3 ab3 d3 f2 | eb2 bb2 g3 bb3 g3 bb2 | ab2 eb3 ab3 c4 ab3 eb3 | bb2 eb3 g3 bb3 g3 eb3 | bb1 f2 d3 ab3 d3 f2 | (eb2 bb2 g3):h. FIN' },
  { id: 'p-moonlight', level: 10, title: 'Moonlight Sonata (opening, simplified)', by: 'Beethoven', clef: 'grand', key: 'C#m', time: '4/4', bpm: 54,
    rh: 'g#3:8t c#4:8t e4:8t g#3:8t c#4:8t e4:8t g#3:8t c#4:8t e4:8t g#3:8t c#4:8t e4:8t | g#3:8t c#4:8t e4:8t g#3:8t c#4:8t e4:8t g#3:8t c#4:8t e4:8t g#3:8t c#4:8t e4:8t | a3:8t c#4:8t e4:8t a3:8t c#4:8t e4:8t a3:8t d4:8t f#4:8t a3:8t d4:8t f#4:8t | g#3:8t b#3:8t f#4:8t g#3:8t c#4:8t e4:8t g#3:8t c#4:8t d#4:8t f#3:8t b#3:8t d#4:8t | g#3:8t c#4:8t e4:8t g#3:8t c#4:8t e4:8t (g#3 c#4 e4):h FIN',
    lh: '(c#2 c#3):w | (b1 b2):w | (a1 a2):h (f#1 f#2) | (g#1 g#2):h (g#1 g#2) | (c#2 c#3):w FIN' },
  { id: 'p-ledger-ladder', level: 7, title: 'Ledger line ladder', by: 'Study', clef: 'treble', time: '4/4', bpm: 72,
    music: 'c4:q d4 e4 c4 | g5 a5 b5 c6 | c6:h a5 | c4:h e4 | g5:q b5 a5 c6 | b3:h c4 | a5:q c6 b5 a5 | c4:w FIN' },
  { id: 'p-bass-ledger', level: 7, title: 'Below and above the bass', by: 'Study', clef: 'bass', time: '4/4', bpm: 72,
    music: 'c2:q e2 g2 c3 | e2:h c2 | c4:q b3 a3 g3 | c4:h e4 | d4:q c4 b3 a3 | f2:h d2 | e2:q g2 b2 e3 | c2:w FIN' },
  { id: 'p-sharp-stroll', level: 7, title: 'Sharp key stroll', by: 'Study', clef: 'treble', key: 'G', time: '4/4', bpm: 84,
    music: 'g4:q a4 b4 c5 | d5:h b4 | c5:q a4 f#4 a4 | g4:w | b4:q c5 d5 e5 | f#5:h d5 | e5:q c5 a4 f#4 | g4:w FIN' },
  { id: 'p-flat-waltz', level: 7, title: 'Flat key waltz', by: 'Study', clef: 'treble', key: 'F', time: '3/4', bpm: 96,
    music: 'f4:q a4 c5 | bb4:h a4:q | g4 bb4 d5 | c5:h. | a4:q c5 f5 | e5:h d5:q | c5 bb4 g4 | f4:h. FIN' },
  { id: 'p-prelude', level: 7, title: 'Prelude in C (pattern)', by: 'J. S. Bach', clef: 'treble', time: '4/4', bpm: 60,
    music: 'c4:16 e4 g4 c5 e5 g4 c5 e5 c4 e4 g4 c5 e5 g4 c5 e5 | c4 d4 a4 d5 f5 a4 d5 f5 c4 d4 a4 d5 f5 a4 d5 f5 | b3 d4 g4 d5 f5 g4 d5 f5 b3 d4 g4 d5 f5 g4 d5 f5 | c4 e4 g4 c5 e5 g4 c5 e5 c4 e4 g4 c5 e5 g4 c5 e5 FIN' },
  { id: 'p-greensleeves', level: 7, title: 'Greensleeves', by: 'Traditional', clef: 'grand', key: 'Am', time: '6/8', bpm: 56,
    rh: 'a4:8 | c5:q d5:8 e5:8. f5:16 e5:8 | d5:q b4:8 g4:8. a4:16 b4:8 | c5:q a4:8 a4:8. g#4:16 a4:8 | b4:q g#4:8 e4:q a4:8 | c5:q d5:8 e5:8. f5:16 e5:8 | d5:q b4:8 g4:8. a4:16 b4:8 | c5:8. b4:16 a4:8 g#4:8. f#4:16 g#4:8 | a4:q. a4:q. FIN',
    lh: 'r:8 | a2:h. | g2:h. | a2:h. | e2:h. | a2:h. | g2:h. | a2:q. e2:q. | a2:h. FIN' },
  { id: 'p-fur-elise', level: 7, title: 'Für Elise (opening)', by: 'Beethoven', clef: 'grand', key: 'Am', time: '3/8', bpm: 60,
    rh: 'e5:16 d#5 | e5 d#5 e5 b4 d5 c5 | a4:8 r:16 c4 e4 a4 | b4:8 r:16 e4 g#4 b4 | c5:8 r:16 e4 e5 d#5 | e5 d#5 e5 b4 d5 c5 | a4:8 r:16 c4 e4 a4 | b4:8 r:16 e4 c5 b4 | a4:q. FIN',
    lh: 'r:8 | r:q. | a2:16 e3 a3 r:8. | e2:16 e3 g#3 r:8. | a2:16 e3 a3 r:8. | r:q. | a2:16 e3 a3 r:8. | e2:16 e3 g#3 r:8. | a2:q. FIN' },
  /* ---------- Genre pieces: full-length pieces in different styles ---------- */
  { id: "p-hometown", level: 9, genre: "Pop", title: "Hometown Lights", by: "Study", clef: "grand", key: "C", time: "4/4", bpm: 72, about: "A pop ballad: two-bar intro, verse, a higher chorus and a short ending. The left hand rocks between root, fifth and octave; keep it soft so the tune sings over it.", rh: "(e4 g4 c5):w | (d4 g4 b4):w | g4:q. e4:8 g4:q c5 | b4:q. a4:8 g4:h | e4:q. e4:8 a4:q c5 | c5:q. b4:8 a4:h | g4:q. e4:8 g4:q c5 | d5:q. c5:8 b4:q g4 | a4:q c5 a4 f4 | g4:w | c5:h a4:q c5 | e5:h d5:q c5 | d5:h. b4:q | c5:q. b4:8 a4:h | f5:q. e5:8 d5:q c5 | e5:h g4:q c5 | d5:q. c5:8 b4:q d5 | c5:w | (a4 c5 f5):w | (g4 c5 e5):w FIN", lh: "c3:8 g3 c4 g3 c3 g3 c4 g3 | g2:8 d3 g3 d3 g2 d3 g3 d3 | c3:8 g3 c4 g3 c3 g3 c4 g3 | g2:8 d3 g3 d3 g2 d3 g3 d3 | a2:8 e3 a3 e3 a2 e3 a3 e3 | f2:8 c3 f3 c3 f2 c3 f3 c3 | c3:8 g3 c4 g3 c3 g3 c4 g3 | g2:8 d3 g3 d3 g2 d3 g3 d3 | f2:8 c3 f3 c3 f2 c3 f3 c3 | g2:8 d3 g3 d3 g2 d3 g3 d3 | f2:8 c3 f3 c3 f2 c3 f3 c3 | c3:8 g3 c4 g3 c3 g3 c4 g3 | g2:8 d3 g3 d3 g2 d3 g3 d3 | a2:8 e3 a3 e3 a2 e3 a3 e3 | f2:8 c3 f3 c3 f2 c3 f3 c3 | c3:8 g3 c4 g3 c3 g3 c4 g3 | g2:8 d3 g3 d3 g2 d3 g3 d3 | c3:8 g3 c4 g3 c3 g3 c4 g3 | f2:8 c3 f3 c3 f2 c3 f3 c3 | (c3 g3):w FIN" },
  { id: "p-sunlit-drive", level: 9, genre: "Pop", title: "Sunlit Drive", by: "Study", clef: "grand", key: "G", time: "4/4", bpm: 108, about: "Upbeat pop. In the verse the left hand drives steady eighth notes on one key; in the chorus it jumps between octaves. Count the dotted rhythms carefully: long-short.", rh: "b4:8 b4 b4 a4 b4:q d5 | a4:q. f#4:8 a4:h | b4:8 a4 g4 a4 b4:q e5 | e4:q. d4:8 e4:h | b4:8 b4 b4 a4 b4:q d5 | e5:q. d5:8 a4:h | c5:8 b4 a4 b4 c5:q e5 | d5:h. r:q | e5:q. d5:8 c5:q e5 | f#5:q. e5:8 d5:h | d5:q b4 g4 b4 | e5:q. d5:8 b4:h | e5:q. d5:8 c5:q e5 | f#5:q. e5:8 d5:q a4 | g5:h. d5:q | (b4 d5 g5):w FIN", lh: "g2:8 g2 g2 g2 g2 g2 g2 g2 | d3:8 d3 d3 d3 d3 d3 d3 d3 | e2:8 e2 e2 e2 e2 e2 e2 e2 | c3:8 c3 c3 c3 c3 c3 c3 c3 | g2:8 g2 g2 g2 g2 g2 g2 g2 | d3:8 d3 d3 d3 d3 d3 d3 d3 | c3:8 c3 c3 c3 c3 c3 c3 c3 | d3:8 d3 d3 d3 d3 d3 d3 d3 | c2:8 c3 c2 c3 c2 c3 c2 c3 | d2:8 d3 d2 d3 d2 d3 d2 d3 | g2:8 g3 g2 g3 g2 g3 g2 g3 | e2:8 e3 e2 e3 e2 e3 e2 e3 | c2:8 c3 c2 c3 c2 c3 c2 c3 | d2:8 d3 d2 d3 d2 d3 d2 d3 | g2:8 g3 g2 g3 g2 g3 g2 g3 | (g2 d3 g3):w FIN" },
  { id: "p-anthem", level: 8, genre: "Pop", title: "Piano Anthem", by: "Study", clef: "grand", key: "F", time: "4/4", bpm: 80, about: "Big pop-piano chords. The tune is the top note of each right-hand chord, so let it ring out a little louder. The left hand plays octaves: thumb and little finger.", rh: "(c4 f4 a4):q (c4 f4 a4) (c4 f4 a4) (f4 a4 c5) | (c4 e4 g4):q (c4 e4 g4) (c4 e4 g4) (g3 c4 e4) | (a3 d4 f4):q (a3 d4 f4) (d4 f4 a4) (d4 f4 a4) | (bb3 d4 f4):q (bb3 d4 f4) (bb3 d4 f4):h | (f4 a4 c5):q (f4 a4 c5) (f4 a4 c5) (c4 f4 a4) | (e4 g4 c5):q (e4 g4 c5) (g4 c5 e5):h | (f4 bb4 d5):q (f4 bb4 d5) (f4 bb4 d5) (d4 f4 bb4) | (e4 g4 c5):h. (e4 g4 bb4):q | (f4 a4 d5):q (f4 a4 d5) (f4 a4 d5) (a4 d5 f5) | (f4 bb4 d5):h (d4 f4 bb4):h | (f4 a4 c5):q (f4 a4 c5) (a4 c5 f5):h | (e4 g4 c5):h (g4 c5 e5):h | (f4 a4 d5):q (f4 a4 d5) (a4 d5 f5) (f4 a4 d5) | (f4 bb4 d5):h (d4 f4 bb4):h | (e4 g4 c5):h (e4 bb4 c5):h | (c4 f4 a4 c5):w FIN", lh: "(f2 f3):h (f2 f3) | (e2 e3):h (e2 e3) | (d2 d3):h (d2 d3) | (bb1 bb2):h (bb1 bb2) | (f2 f3):h (f2 f3) | (c2 c3):h (c2 c3) | (bb1 bb2):h (bb1 bb2) | (c2 c3):h (c2 c3) | (d2 d3):h (d2 d3) | (bb1 bb2):h (bb1 bb2) | (f2 f3):h (f2 f3) | (e2 e3):h (e2 e3) | (d2 d3):h (d2 d3) | (bb1 bb2):h (bb1 bb2) | (c2 c3):h (c2 c3) | (f2 c3 f3):w FIN" },
  { id: "p-garage-riff", level: 8, genre: "Rock", title: "Garage Riff", by: "Study", clef: "grand", key: "Em", time: "4/4", bpm: 112, about: "Rock piano. The left hand plays a riff like a bass guitar, then pounds power fifths in the chorus. Play the right-hand stabs short and punchy.", rh: "(e4 g4 b4):8 (e4 g4 b4):q (e4 g4 b4):8 r:h | (e4 g4 b4):8 (e4 g4 b4):q (e4 g4 b4):8 r:h | (e4 g4 c5):8 (e4 g4 c5):q (e4 g4 c5):8 r:h | (d4 f#4 a4):8 (d4 f#4 a4):q (d4 f#4 a4):8 (d4 f#4 a4):h | b4:q b4:8 a4 g4:q e4 | g4:q. a4:8 b4:h | c5:q c5:8 b4 a4:q g4 | a4:q. g4:8 f#4:h | (g4 b4 d5):q. (g4 b4 d5):8 (g4 b4 d5):h | (f#4 a4 d5):q. (f#4 a4 d5):8 (f#4 a4 d5):h | (e4 g4 b4):q. (e4 g4 b4):8 (e4 g4 b4):h | (e4 g4 c5):q. (e4 g4 c5):8 (e4 g4 c5):q (d4 f#4 a4) | (g4 b4 d5):q. (g4 b4 d5):8 (g4 b4 d5):h | (f#4 a4 d5):q. (f#4 a4 d5):8 (f#4 a4 d5):h | (e4 g4 c5):h (d4 f#4 a4):h | (e4 g4 b4 e5):w FIN", lh: "e2:8 e2 g2 e2 a2 e2 g2 b2 | e2:8 e2 g2 e2 a2 e2 g2 b2 | c3:8 c3 e3 c3 f3 c3 e3 g3 | d3:8 d3 f#3 d3 g3 d3 f#3 a3 | e2:8 e2 g2 e2 a2 e2 g2 b2 | e2:8 e2 g2 e2 a2 e2 g2 b2 | c3:8 c3 e3 c3 f3 c3 e3 g3 | d3:8 d3 f#3 d3 g3 d3 f#3 a3 | (g2 d3):8 (g2 d3) (g2 d3) (g2 d3) (g2 d3) (g2 d3) (g2 d3) (g2 d3) | (d2 a2):8 (d2 a2) (d2 a2) (d2 a2) (d2 a2) (d2 a2) (d2 a2) (d2 a2) | (e2 b2):8 (e2 b2) (e2 b2) (e2 b2) (e2 b2) (e2 b2) (e2 b2) (e2 b2) | (c2 g2):8 (c2 g2) (c2 g2) (c2 g2) (c2 g2) (c2 g2) (c2 g2) (c2 g2) | (g2 d3):8 (g2 d3) (g2 d3) (g2 d3) (g2 d3) (g2 d3) (g2 d3) (g2 d3) | (d2 a2):8 (d2 a2) (d2 a2) (d2 a2) (d2 a2) (d2 a2) (d2 a2) (d2 a2) | (c2 g2):8 (c2 g2) (c2 g2) (c2 g2) (d2 a2) (d2 a2) (d2 a2) (d2 a2) | (e2 b2 e3):w FIN" },
  { id: "p-rock-roll", level: 8, genre: "Rock", title: "Rock and Roll Twelve", by: "Study", clef: "grand", key: "A", time: "4/4", bpm: 150, about: "1950s rock and roll on the twelve-bar pattern. The left hand walks up and down each chord; the right hand hammers repeated chords. Keep the wrist loose so you don’t tire.", rh: "(e4 a4 c#5):8 (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5):q r:q | (e4 a4 c#5):8 (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5):q r:q | (e4 a4 c#5):8 (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5):q r:q | (e4 a4 c#5):8 (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5):q r:q | (f#4 a4 d5):8 (f#4 a4 d5) (f#4 a4 d5) (f#4 a4 d5) (f#4 a4 d5):q r:q | (f#4 a4 d5):8 (f#4 a4 d5) (f#4 a4 d5) (f#4 a4 d5) (f#4 a4 d5):q r:q | (e4 a4 c#5):8 (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5):q r:q | (e4 a4 c#5):8 (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5):q r:q | (d4 g#4 b4):8 (d4 g#4 b4) (d4 g#4 b4) (d4 g#4 b4) (d4 g#4 b4):q r:q | (f#4 a4 d5):8 (f#4 a4 d5) (f#4 a4 d5) (f#4 a4 d5) (f#4 a4 d5):q r:q | (e4 a4 c#5):8 (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5) (e4 a4 c#5):q r:q | (d4 g#4 b4):8 (d4 g#4 b4) (d4 g#4 b4) (d4 g#4 b4) (d4 g#4 b4):q r:q | (e4 a4 c#5 e5):h r:h FIN", lh: "a2:8 c#3 e3 f#3 g3 f#3 e3 c#3 | a2:8 c#3 e3 f#3 g3 f#3 e3 c#3 | a2:8 c#3 e3 f#3 g3 f#3 e3 c#3 | a2:8 c#3 e3 f#3 g3 f#3 e3 c#3 | d3:8 f#3 a3 b3 c4 b3 a3 f#3 | d3:8 f#3 a3 b3 c4 b3 a3 f#3 | a2:8 c#3 e3 f#3 g3 f#3 e3 c#3 | a2:8 c#3 e3 f#3 g3 f#3 e3 c#3 | e2:8 g#2 b2 c#3 d3 c#3 b2 g#2 | d3:8 f#3 a3 b3 c4 b3 a3 f#3 | a2:8 c#3 e3 f#3 g3 f#3 e3 c#3 | e2:8 g#2 b2 c#3 d3 c#3 b2 g#2 | (a2 e3 a3):h r:h FIN" },
  { id: "p-minor-blues", level: 9, genre: "Blues", title: "Slow Minor Blues", by: "Study", clef: "grand", key: "Am", time: "4/4", bpm: 66, swing: true, about: "A slow twelve-bar blues in A minor. Swing the eighth notes: long-short, long-short. The E♭ is a “blue note” that rubs against the chord on purpose.", rh: "e5:q. d5:8 c5:q a4 | c5:8 d5 f5:q. d5:8 c5:q | e5:8 eb5 d5 c5 a4:h | r:q c5:8 d5 e5:q g5 | a5:q. g5:8 f5:q d5 | f5:8 e5 d5 c5 a4:h | e5:q. d5:8 c5:q a4 | c5:8 a4 g4:q a4:h | a4:q c5 eb5 c5 | b4:8 d5 b4 g#4 e4:h | a4:q c5:8 e5 a5:h | b4:q g#4:8 e4 g#4:h | (c5 e5 a5):w FIN", lh: "a2:q (c3 e3 g3) e2 (c3 e3 g3) | d3:q (f3 a3 c4) a2 (f3 a3 c4) | a2:q (c3 e3 g3) e2 (c3 e3 g3) | a2:q (c3 e3 g3) e2 (c3 e3 g3) | d3:q (f3 a3 c4) a2 (f3 a3 c4) | d3:q (f3 a3 c4) a2 (f3 a3 c4) | a2:q (c3 e3 g3) e2 (c3 e3 g3) | a2:q (c3 e3 g3) e2 (c3 e3 g3) | f2:q (a2 eb3) c3 (a2 eb3) | e2:q (g#2 d3) b2 (g#2 d3) | a2:q (c3 e3 g3) e2 (c3 e3 g3) | e2:q (g#2 d3) b2 (g#2 d3) | (a2 e3 g3):w FIN" },
  { id: "p-boogie", level: 10, genre: "Blues", title: "Boogie-Woogie Bounce", by: "Study", clef: "grand", key: "G", time: "4/4", bpm: 116, swing: true, about: "Boogie-woogie: the left hand never stops. Learn the left-hand pattern alone until it runs on autopilot, then add the right-hand licks. B♭ to B is the classic blues slide.", rh: "bb4:8 b4 d5 g5 d5:q b4 | g5:8 f5 d5 b4 g4:h | bb4:8 b4 d5 g5 d5:q b4 | g5:q. f5:8 d5:q b4 | bb4:8 c5 e5 g5 e5:q c5 | g5:8 e5 c5 bb4 g4:h | bb4:8 b4 d5 g5 d5:q b4 | d5:8 b4 g4:q g4:h | a4:8 c5 d5 f#5 a5:q f#5 | g5:8 e5 c5 bb4 g4:h | bb4:8 b4 d5 g5 d5:q b4 | a4:q c5 d5 f#5 | (g4 b4 d5 g5):h r:h FIN", lh: "g2:8 b2 d3 e3 f3 e3 d3 b2 | g2:8 b2 d3 e3 f3 e3 d3 b2 | g2:8 b2 d3 e3 f3 e3 d3 b2 | g2:8 b2 d3 e3 f3 e3 d3 b2 | c3:8 e3 g3 a3 bb3 a3 g3 e3 | c3:8 e3 g3 a3 bb3 a3 g3 e3 | g2:8 b2 d3 e3 f3 e3 d3 b2 | g2:8 b2 d3 e3 f3 e3 d3 b2 | d3:8 f#3 a3 b3 c4 b3 a3 f#3 | c3:8 e3 g3 a3 bb3 a3 g3 e3 | g2:8 b2 d3 e3 f3 e3 d3 b2 | d3:8 f#3 a3 b3 c4 b3 a3 f#3 | (g2 d3 g3):h r:h FIN" },
  { id: "p-two-five", level: 10, genre: "Jazz", title: "Two-Five Stroll", by: "Study", clef: "grand", key: "C", time: "4/4", bpm: 100, swing: true, about: "Jazz built on the ii–V–I (two-five-one) progression. The left hand plays “shell” chords: just the root and the 7th. Swing the eighths and lean on the off-beats.", rh: "f4:8 a4 c5 e5 d5:q a4 | b4:8 d5 f5 a5 g5:h | e5:q. d5:8 c5:q b4 | e5:h. r:q | g4:8 b4 d5 e5 g5:q e5 | c#5:8 e5 g5 e5 c#5:q a4 | f5:q. e5:8 d5:q c5 | b4:8 c5 d5 f5 b4:h | a4:q f4 a4 c5 | d5:q. c5:8 b4:q g4 | e5:8 d5 c5 b4 g4:h | a4:8 c5 e5 g5 e5:h | f5:q. e5:8 d5:q a4 | g4:8 b4 d5 f5 a5:q g5 | e5:h. d5:q | (g4 b4 e5):w FIN", lh: "(d3 c4):h (d3 c4) | (g2 f3):h (g2 f3) | (c3 b3):h (c3 b3) | (c3 b3):h (c3 b3) | (e3 d4):h (e3 d4) | (a2 g3):h (a2 g3) | (d3 c4):h (d3 c4) | (g2 f3):h (g2 f3) | (d3 c4):h (d3 c4) | (g2 f3):h (g2 f3) | (c3 b3):h (c3 b3) | (a2 g3):h (a2 g3) | (d3 c4):h (d3 c4) | (g2 f3):h (g2 f3) | (c3 b3):h (c3 b3) | (c3 g3 b3):w FIN" },
  { id: "p-jazz-waltz", level: 9, genre: "Jazz", title: "Jazz Waltz in F", by: "Study", clef: "grand", key: "F", time: "3/4", bpm: 120, about: "A jazz waltz: three beats in a bar, with seventh chords. The left hand plays the root on beat 1 and a two-note chord on beat 2. Feel one big pulse per bar.", rh: "a4:h c5:q | f5:h e5:q | d5:h bb4:q | c5:h. | e5:h c5:q | f#5:h d5:q | g5:h f5:q | e5:h. | a4:q c5 f5 | d5:h a4:q | c5:q e5 g5 | f#5:h. | f5:q d5 bb4 | bb4:q c5 e5 | f5:h.~ | f5:h. FIN", lh: "f2:q (a2 e3):h | d3:q (f3 c4):h | g2:q (bb2 f3):h | c3:q (e3 bb3):h | a2:q (c3 g3):h | d3:q (f#3 c4):h | g2:q (bb2 f3):h | c3:q (e3 bb3):h | f2:q (a2 e3):h | bb2:q (d3 a3):h | a2:q (c3 g3):h | d3:q (f#3 c4):h | g2:q (bb2 f3):h | c3:q (e3 bb3):h | f2:q (a2 c3 f3):h | (f2 c3 a3):h. FIN" },
  { id: "p-bossa", level: 9, genre: "Latin", title: "Bossa for Beginners", by: "Study", clef: "grand", key: "C", time: "4/4", bpm: 120, about: "Bossa nova from Brazil. The left hand plays root and fifth in a long-short pattern; the right-hand melody often lands just before the beat. Keep it relaxed and quiet.", rh: "g4:q. e5:8 e5:h | d5:q. c5:8 b4:h | a4:q. c5:8 f5:h | e5:q. d5:8 b4:h | g4:q. b4:8 e5:h | e5:q. c#5:8 g4:h | f4:q. a4:8 d5:q c5 | b4:h. g4:q | e5:q. g5:8 e5:h | bb4:q. c5:8 e5:h | a4:q. c5:8 e5:h | ab4:q. c5:8 eb5:h | g4:q. b4:8 d5:h | c#5:q. e5:8 g5:h | f5:q. e5:8 d5:q a4 | b4:q. d5:8 f5:q e5 | (e4 g4 b4 e5):w FIN", lh: "c3:q. g2:8 g2:q. c3:8 | c3:q. g2:8 g2:q. c3:8 | d3:q. a2:8 a2:q. d3:8 | g2:q. d3:8 d3:q. g2:8 | e3:q. b2:8 b2:q. e3:8 | a2:q. e3:8 e3:q. a2:8 | d3:q. a2:8 a2:q. d3:8 | g2:q. d3:8 d3:q. g2:8 | c3:q. g2:8 g2:q. c3:8 | c3:q. g2:8 g2:q. c3:8 | f2:q. c3:8 c3:q. f2:8 | f2:q. c3:8 c3:q. f2:8 | e3:q. b2:8 b2:q. e3:8 | a2:q. e3:8 e3:q. a2:8 | d3:q. a2:8 a2:q. d3:8 | g2:q. d3:8 d3:q. g2:8 | (c3 g3 b3):w FIN" },
  { id: "p-habanera", level: 9, genre: "Latin", title: "Habanera Night", by: "Study", clef: "grand", key: "Dm", time: "4/4", bpm: 76, about: "The habanera rhythm from Cuba, later used in tango. Left hand: long, short, then two even notes. The quick three-note groups in the right hand are triplets: three notes in one beat.", rh: "a4:h d5:8t e5:8t f5:8t e5:q | e5:q. d5:8 c#5:h | e5:8t f5:8t e5:8t d5:q c#5:q bb4:q | a4:w | f5:q. e5:8 d5:q a4 | bb4:q. a4:8 g4:q d5 | c#5:8t d5:8t e5:8t g5:q f5:q e5:q | d5:w | c5:q. a4:8 f4:q a4 | bb4:q. g4:8 e4:q g4 | bb4:8t c5:8t d5:8t e5:q g5:q e5:q | f5:h. c5:q | d5:q. bb4:8 g4:q bb4 | a4:q. f4:8 d4:q f4 | e4:8t f4:8t g4:8t a4:q c#5:q e5:q | (f4 a4 d5):w FIN", lh: "d3:q. a2:8 f3:q a3 | a2:q. e2:8 c#3:q e3 | a2:q. e2:8 c#3:q e3 | d3:q. a2:8 f3:q a3 | d3:q. a2:8 f3:q a3 | g2:q. d3:8 bb2:q d3 | a2:q. e2:8 c#3:q e3 | d3:q. a2:8 f3:q a3 | f2:q. c3:8 a2:q c3 | c3:q. g2:8 e3:q g3 | c3:q. g2:8 e3:q g3 | f2:q. c3:8 a2:q c3 | g2:q. d3:8 bb2:q d3 | d3:q. a2:8 f3:q a3 | a2:q. e2:8 c#3:q e3 | (d2 a2 d3):w FIN" },
  { id: "p-credits", level: 8, genre: "Film & Game", title: "Opening Credits", by: "Study", clef: "grand", key: "Dm", time: "4/4", bpm: 84, about: "An epic film theme. The left hand pulses in octaves, first in crotchets then in quavers to build tension. The second time, the right hand plays the theme in octaves.", rh: "a4:q. d5:8 d5:h | f5:q. d5:8 bb4:h | c5:q. a4:8 c5:q f5 | g5:h e5:h | a4:q. d5:8 d5:q e5 | f5:q. g5:8 f5:q d5 | g5:q. f5:8 d5:q bb4 | c#5:w | (a3 a4):q. (d4 d5):8 (d4 d5):h | (f4 f5):q. (d4 d5):8 (bb3 bb4):h | (c4 c5):q. (a3 a4):8 (c4 c5):q (f4 f5) | (g4 g5):h (e4 e5):h | (d4 d5):q. (g4 g5):8 (g4 g5):h | (f4 f5):q. (d4 d5):8 (bb3 bb4):q (d4 d5) | (c#4 c#5):q. (e4 e5):8 (e4 e5):q (c#4 c#5) | (d4 f4 a4 d5):w FIN", lh: "(d2 d3):q (d2 d3) (d2 d3) (d2 d3) | (bb1 bb2):q (bb1 bb2) (bb1 bb2) (bb1 bb2) | (f2 f3):q (f2 f3) (f2 f3) (f2 f3) | (c2 c3):q (c2 c3) (c2 c3) (c2 c3) | (d2 d3):q (d2 d3) (d2 d3) (d2 d3) | (bb1 bb2):q (bb1 bb2) (bb1 bb2) (bb1 bb2) | (g2 g3):q (g2 g3) (g2 g3) (g2 g3) | (a1 a2):q (a1 a2) (a1 a2) (a1 a2) | (d2 d3):8 (d2 d3) (d2 d3) (d2 d3) (d2 d3) (d2 d3) (d2 d3) (d2 d3) | (bb1 bb2):8 (bb1 bb2) (bb1 bb2) (bb1 bb2) (bb1 bb2) (bb1 bb2) (bb1 bb2) (bb1 bb2) | (f2 f3):8 (f2 f3) (f2 f3) (f2 f3) (f2 f3) (f2 f3) (f2 f3) (f2 f3) | (c2 c3):8 (c2 c3) (c2 c3) (c2 c3) (c2 c3) (c2 c3) (c2 c3) (c2 c3) | (g2 g3):8 (g2 g3) (g2 g3) (g2 g3) (g2 g3) (g2 g3) (g2 g3) (g2 g3) | (bb1 bb2):8 (bb1 bb2) (bb1 bb2) (bb1 bb2) (bb1 bb2) (bb1 bb2) (bb1 bb2) (bb1 bb2) | (a1 a2):8 (a1 a2) (a1 a2) (a1 a2) (a1 a2) (a1 a2) (a1 a2) (a1 a2) | (d2 a2 d3):w FIN" },
  { id: "p-pixel-quest", level: 5, genre: "Film & Game", title: "Pixel Quest", by: "Study", clef: "grand", key: "C", time: "4/4", bpm: 126, about: "A bouncy video-game theme. The right hand runs up and down chord shapes; the left hand bounces between root and fifth. Start slowly with Show keys on, then speed up.", rh: "c5:8 e5 g5 e5 c5:q g4 | a4:8 c5 e5 c5 a4:q e4 | f4:8 a4 c5 a4 f4:q c5 | d5:8 b4 g4 b4 d5:h | e5:8 d5 c5 d5 e5:q g5 | e5:8 d5 c5 b4 a4:h | f5:8 e5 d5 c5 a4:q c5 | b4:8 c5 d5 b4 g4:h | a4:q c5 f5 c5 | b4:q d5 g5 d5 | g4:8 b4 e5 b4 g4:q b4 | a4:8 c5 e5 c5 a4:q c5 | c5:8 a4 f4 a4 c5:q f5 | d5:8 b4 g4 b4 d5:q g5 | e5:8 g5 e5 c5 g4:q e5 | c5:q g4 c5:h FIN", lh: "c3:q g2 c3 g2 | a2:q e3 a2 e3 | f2:q c3 f2 c3 | g2:q d3 g2 d3 | c3:q g2 c3 g2 | a2:q e3 a2 e3 | f2:q c3 f2 c3 | g2:q d3 g2 d3 | f2:q c3 f2 c3 | g2:q d3 g2 d3 | e2:q b2 e2 b2 | a2:q e3 a2 e3 | f2:q c3 f2 c3 | g2:q d3 g2 d3 | c3:q g2 c3 g2 | c3:q g2 c3:h FIN" },
  { id: "p-snowfall", level: 9, genre: "Film & Game", title: "Snowfall", by: "Study", clef: "grand", key: "Em", time: "3/4", bpm: 80, about: "A quiet, film-style piece. The left hand ripples through broken chords in quavers; the right-hand tune is slow and simple. Use the sustain pedal if you have one, changing it on every new chord.", rh: "b4:h. | g4:h e4:q | d5:h b4:q | a4:h. | g4:q b4 e5 | e5:h d5:q | c5:q b4 a4 | d#5:h. | e5:h g5:q | f#5:h d5:q | d5:q b4 g4 | e5:h. | c5:q e5 c5 | b4:q d#5 f#5 | e5:h. | (g4 b4 e5):h. FIN", lh: "e2:8 b2 e3 g3 e3 b2 | c2:8 g2 c3 e3 c3 g2 | g2:8 d3 g3 b3 g3 d3 | d2:8 a2 d3 f#3 d3 a2 | e2:8 b2 e3 g3 e3 b2 | c2:8 g2 c3 e3 c3 g2 | a2:8 e3 a3 c4 a3 e3 | b1:8 f#2 a2 d#3 a2 f#2 | c2:8 g2 c3 e3 c3 g2 | d2:8 a2 d3 f#3 d3 a2 | g2:8 d3 g3 b3 g3 d3 | e2:8 b2 e3 g3 e3 b2 | a2:8 e3 a3 c4 a3 e3 | b1:8 f#2 a2 d#3 a2 f#2 | e2:8 b2 e3 g3 e3 b2 | (e2 b2 g3):h. FIN" },
  { id: "p-sunday-morning", level: 8, genre: "Gospel & Soul", title: "Sunday Morning", by: "Study", clef: "grand", key: "Bb", time: "6/8", bpm: 56, about: "A gospel ballad in 6/8: count two big beats per bar, each split into three. Listen for bar 12, where the chord turns minor (E♭ minor) for that warm church sound.", rh: "(d4 f4 bb4):q (d4 f4 bb4):8 (f4 bb4 d5):q. | (eb4 g4 bb4):q (eb4 g4 c5):8 (g4 bb4 eb5):q. | (f4 bb4 d5):q. (d4 f4 bb4):q. | (c4 f4 a4):q. (c4 eb4 a4):q. | (d4 g4 bb4):q (d4 g4 bb4):8 (g4 bb4 d5):q. | (g4 bb4 eb5):q (g4 bb4 eb5):8 (g4 c5 eb5):q. | (f4 bb4 d5):q. (d4 f4 bb4):q. | (c4 f4 a4):q. (eb4 f4 a4):q. | (d4 f4 bb4):q (d4 f4 bb4):8 (f4 bb4 d5):q. | (d4 ab4 bb4):q. (f4 ab4 d5):q. | (eb4 g4 bb4):q (eb4 g4 c5):8 (g4 bb4 eb5):q. | (eb4 gb4 bb4):q. (gb4 bb4 eb5):q. | (f4 bb4 d5):q. (d4 f4 bb4):q. | (d4 g4 bb4):q. (g4 bb4 d5):q. | (eb4 g4 bb4):q. (eb4 f4 a4):q. | (d4 f4 bb4 d5):h. FIN", lh: "(bb1 bb2):q. f2:q. | (eb2 eb3):q. bb2:q. | (bb1 bb2):q. f2:q. | (f2 f3):q. c3:q. | (g2 g3):q. d3:q. | (eb2 eb3):q. bb2:q. | (f2 f3):q. bb2:q. | (f2 f3):q. c3:q. | (bb1 bb2):q. f2:q. | (bb1 bb2):q. ab2:q. | (eb2 eb3):q. bb2:q. | (eb2 eb3):q. bb2:q. | (d2 d3):q. bb2:q. | (g2 g3):q. d3:q. | (eb2 eb3):q. (f2 f3):q. | (bb1 f2 bb2):h. FIN" },
  { id: "p-soul-groove", level: 10, genre: "Gospel & Soul", title: "Soul Groove", by: "Study", clef: "grand", key: "C", time: "4/4", bpm: 88, about: "Neo-soul over four falling seventh chords. The left-hand bass has a gap (a rest) in the middle of the bar; that silence is part of the groove. The right hand plays off-beat chords, then a melody.", rh: "(a4 c5 e5):8 (a4 c5 e5):q (a4 c5 e5):8 r:q (a4 c5 e5):q | (g4 b4 d5):8 (g4 b4 d5):q (g4 b4 d5):8 r:q (g4 b4 d5):q | (f4 a4 c5):8 (f4 a4 c5):q (f4 a4 c5):8 r:q (f4 a4 c5):q | (e4 g4 b4):8 (e4 g4 b4):q (e4 g4 b4):8 r:q (e4 g4 b4):q | (a4 c5 e5):8 (a4 c5 e5):q (a4 c5 e5):8 r:q (a4 c5 e5):q | (g4 b4 d5):8 (g4 b4 d5):q (g4 b4 d5):8 r:q (g4 b4 d5):q | (f4 a4 c5):8 (f4 a4 c5):q (f4 a4 c5):8 r:q (f4 a4 c5):q | (e4 g4 b4):8 (e4 g4 b4):q (e4 g4 b4):8 r:q (e4 g4 b4):q | a4:8 c5 e5 g5 e5:h | d5:8 b4 g4 b4 d5:q e5 | c5:8 a4 f4 a4 c5:q. d5:8 | e5:q. d5:8 b4:h | c5:8 e5 g5 e5 c5:q a4 | b4:8 d5 g5 d5 b4:q g4 | a4:8 c5 f5 e5 d5:q c5 | (e4 g4 b4 e5):w FIN", lh: "f2:q. f2:8 r:8 c3:8 f3:q | e2:q. e2:8 r:8 b2:8 e3:q | d2:q. d2:8 r:8 a2:8 d3:q | c3:q. c3:8 r:8 g2:8 b2:q | f2:q. f2:8 r:8 c3:8 f3:q | e2:q. e2:8 r:8 b2:8 e3:q | d2:q. d2:8 r:8 a2:8 d3:q | c3:q. c3:8 r:8 g2:8 b2:q | f2:q. f2:8 r:8 c3:8 f3:q | e2:q. e2:8 r:8 b2:8 e3:q | d2:q. d2:8 r:8 a2:8 d3:q | c3:q. c3:8 r:8 g2:8 b2:q | f2:q. f2:8 r:8 c3:8 f3:q | e2:q. e2:8 r:8 b2:8 e3:q | d2:q. d2:8 r:8 a2:8 d3:q | c3:w FIN" },
  { id: "p-island-skank", level: 8, genre: "Reggae", title: "Island Skank", by: "Study", clef: "grand", key: "G", time: "4/4", bpm: 80, about: "Reggae. In the first half the right hand plays only on the “and” of each beat (the skank) while the left hand plays the bass line. Play the chords short, like a guitar chop.", rh: "r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 | r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 | r:8 (c4 e4 g4):8 r:8 (c4 e4 g4):8 r:8 (c4 e4 g4):8 r:8 (c4 e4 g4):8 | r:8 (d4 f#4 a4):8 r:8 (d4 f#4 a4):8 r:8 (d4 f#4 a4):8 r:8 (d4 f#4 a4):8 | r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 | r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 r:8 (b3 d4 g4):8 | r:8 (c4 e4 g4):8 r:8 (c4 e4 g4):8 r:8 (c4 e4 g4):8 r:8 (c4 e4 g4):8 | r:8 (d4 f#4 a4):8 r:8 (d4 f#4 a4):8 r:8 (d4 f#4 a4):8 r:8 (d4 f#4 a4):8 | b4:q. g4:8 e4:q g4 | e5:q. d5:8 c5:h | d5:q. b4:8 g4:q b4 | a4:q. f#4:8 a4:h | g4:q. b4:8 e5:q d5 | e5:q. g5:8 e5:q c5 | d5:q. c5:8 a4:q f#4 | (g4 b4 d5):w FIN", lh: "g2:q. g2:8 b2:q d3 | g2:q. g2:8 b2:q d3 | c3:q. c3:8 e3:q g3 | d3:q. d3:8 f#3:q a3 | g2:q. g2:8 b2:q d3 | g2:q. g2:8 b2:q d3 | c3:q. c3:8 e3:q g3 | d3:q. d3:8 f#3:q a3 | e2:q. e2:8 g2:q b2 | c3:q. c3:8 e3:q g3 | g2:q. g2:8 b2:q d3 | d3:q. d3:8 f#3:q a3 | e2:q. e2:8 g2:q b2 | c3:q. c3:8 e3:q g3 | d3:q. d3:8 f#3:q a3 | g2:w FIN" },
  { id: "p-lofi", level: 9, genre: "Lo-fi", title: "Late Night Lo-fi", by: "Study", clef: "grand", key: "F", time: "4/4", bpm: 72, swing: true, about: "Lo-fi hip-hop: lazy, swung and jazzy. The left hand just holds the root and 7th. In the second half the right hand plays four-note jazz chords that arrive half a beat late.", rh: "bb4:8 d5 f5 a5 g5:h | e5:q. d5:8 bb4:h | a4:8 c5 e5 c5 a4:h | f4:q. a4:8 c5:h | d5:8 f5 a5 f5 d5:q bb4 | g4:8 bb4 d5 e5 c5:h | e5:q. c5:8 a4:q g4 | a4:w | r:8 (bb3 d4 f4 a4):q. (bb3 d4 f4 a4):h | r:8 (bb3 d4 e4 a4):q. (bb3 d4 e4 a4):h | r:8 (a3 c4 e4 g4):q. (a3 c4 e4 g4):h | r:8 (c4 e4 f4 a4):q. (c4 e4 f4 a4):h | r:8 (bb3 d4 f4 a4):q. (bb3 d4 f4 a4):h | r:8 (bb3 d4 e4 a4):q. (bb3 d4 e4 a4):h | r:8 (a3 c4 e4 g4):q. (a3 c4 e4 g4):h | (a3 c4 e4 g4):w FIN", lh: "(g2 f3):w | (c3 bb3):w | (f2 e3):w | (d3 c4):w | (g2 f3):w | (c3 bb3):w | (f2 e3):w | (d3 c4):w | (g2 f3):w | (c3 bb3):w | (f2 e3):w | (d3 c4):w | (g2 f3):w | (c3 bb3):w | (f2 e3):w | (f2 e3):w FIN" },
  { id: "p-oh-susanna", level: 5, genre: "Folk", title: "Oh! Susanna", by: "Stephen Foster", clef: "grand", key: "C", time: "4/4", bpm: 96, about: "An American folk song from 1848, verse and chorus. It starts with a pickup: two quavers before the first full bar. The left hand moves on every half note.", rh: "c4:8 d4 | e4:q g4 g4:q. a4:8 | g4:q e4 c4:q. d4:8 | e4:q e4 d4 c4 | d4:h. c4:8 d4:8 | e4:q g4 g4:q. a4:8 | g4:q e4 c4:q. d4:8 | e4:q e4 d4 d4 | c4:h. r:q | f4:h a4:q a4 | g4:q g4 e4 c4 | d4:h. c4:8 d4:8 | e4:q g4 g4:q. a4:8 | g4:q e4 c4:q. d4:8 | e4:q e4 d4 d4 | c4:h. FIN", lh: "r:q | c3:h g2 | c3:h e3 | c3:h g2 | g2:h d3 | c3:h g2 | c3:h e3 | c3:h g2 | c3:w | f2:h a2 | c3:h e3 | g2:h d3 | c3:h g2 | c3:h e3 | c3:h g2 | c3:h. FIN" },
  { id: "p-drunken-sailor", level: 5, genre: "Folk", title: "Drunken Sailor", by: "Traditional", clef: "grand", key: "C", time: "4/4", bpm: 104, about: "A sea shanty, verse then chorus. It uses the Dorian mode: it sounds minor but has a B natural instead of B♭, so there is no key signature. The left hand stomps root and fifth.", rh: "a4:q a4:8 a4 a4:q a4:8 a4 | a4:q d4 f4 a4 | g4:q g4:8 g4 g4:q g4:8 g4 | g4:q c4 e4 g4 | a4:q a4:8 a4 a4:q a4:8 a4 | a4:q b4 c5 d5 | c5:q a4 g4 e4 | d4:h d4:h | a4:h a4:h | a4:q d4 f4 a4 | g4:h g4:h | g4:q c4 e4 g4 | a4:h a4:h | a4:q b4 c5 d5 | c5:q a4 g4 e4 | d4:h d4:h FIN", lh: "d3:q a2 d3 a2 | d3:q a2 d3 a2 | c3:q g2 c3 g2 | c3:q g2 c3 g2 | d3:q a2 d3 a2 | d3:q a2 d3 a2 | c3:h a2:h | d3:h d2:h | d3:q a2 d3 a2 | d3:q a2 d3 a2 | c3:q g2 c3 g2 | c3:q g2 c3 g2 | d3:q a2 d3 a2 | d3:q a2 d3 a2 | c3:h a2:h | (d2 a2 d3):w FIN" },
  { id: "p-kerry-jig", level: 10, genre: "Folk", title: "Kerry Hills Jig", by: "Study", clef: "grand", key: "D", time: "6/8", bpm: 100, about: "An Irish-style jig in two parts (A and B). In 6/8 the quavers run in groups of three: ONE-two-three FOUR-five-six. Aim for an even, dancing flow rather than speed.", rh: "a4:8 f#4 a4 d5 a4 f#4 | g4:8 b4 d5 g5 d5 b4 | f#4:8 a4 d5 f#5 e5 d5 | e5:8 c#5 a4 e4 a4 c#5 | d5:8 f#5 e5 d5 a4 f#4 | g4:8 b4 d5 b4 g4 b4 | a4:8 c#5 e5 g5 e5 c#5 | d5:q a4:8 d5:q. | b4:8 d5 f#5 d5 b4 f#4 | g4:8 b4 d5 e5 d5 b4 | a4:8 d5 f#5 e5 d5 a4 | c#5:8 e5 a5 e5 c#5 a4 | d5:8 c#5 b4 f#4 b4 d5 | b4:8 a4 g4 d4 g4 b4 | e5:8 d5 c#5 a4 c#5 e5 | d5:q. d5:q. FIN", lh: "d3:q. (f#3 a3):q. | g2:q. (b2 d3):q. | d3:q. (f#3 a3):q. | a2:q. (c#3 e3):q. | d3:q. (f#3 a3):q. | g2:q. (b2 d3):q. | a2:q. (c#3 e3):q. | d3:q. (f#3 a3):q. | b2:q. (d3 f#3):q. | g2:q. (b2 d3):q. | d3:q. (f#3 a3):q. | a2:q. (c#3 e3):q. | b2:q. (d3 f#3):q. | g2:q. (b2 d3):q. | a2:q. (c#3 e3):q. | (d2 a2 d3):h. FIN" },
];
/* every piece has a genre; studies and folk tunes are filled in here */
const GENRE_OVERRIDES = { 'p-pop-chords': 'Pop', 'p-ballad': 'Pop', 'p-blues-c': 'Blues', 'p-ragtime': 'Jazz', 'p-walking-g': 'Jazz',
  'p-amazing': 'Gospel & Soul', 'p-amazing-waltz': 'Gospel & Soul', 'p-evening-hymn': 'Gospel & Soul', 'p-saints': 'Gospel & Soul' };
PIECES.forEach(p => { if (!p.genre) p.genre = GENRE_OVERRIDES[p.id] || (p.by === 'Study' ? 'Studies' : p.by === 'Traditional' ? 'Folk' : 'Classical'); });
const PIECE_GENRES = ['Pop', 'Rock', 'Blues', 'Jazz', 'Latin', 'Film & Game', 'Gospel & Soul', 'Reggae', 'Lo-fi', 'Folk', 'Classical', 'Studies'];

/* ---------------- Keys ---------------- */
const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
const RELATIVE_MINOR = { C: 'Am', G: 'Em', D: 'Bm', A: 'F#m', E: 'C#m', B: 'G#m', 'F#': 'D#m', 'C#': 'A#m', F: 'Dm', Bb: 'Gm', Eb: 'Cm', Ab: 'Fm', Db: 'Bbm', Gb: 'Ebm', Cb: 'Abm' };
function keyName(k) { return k.replace('#', '♯').replace(/b(?=m?$)/, '♭').replace(/^([A-G])b/, '$1♭').replace(/m$/, ' minor') + (/m$/.test(k) ? '' : ' major'); }
const MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10, 12], HARMONIC_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 11, 12];
// any scale by its steps from the tonic ('D' or 'Dm'), spelt one letter per note
function scaleFrom(tonic, oct, steps) {
  const t = tonic.replace(/m$/, ''), L = t[0].toLowerCase(), alter = t.includes('#') ? 1 : t.length > 1 && t[1] === 'b' ? -1 : 0;
  const li = LETTERS.indexOf(L), tpc = (PC[L] + alter + 12) % 12, out = [];
  for (let i = 0; i < 8; i++) {
    const letter = LETTERS[(li + i) % 7], o = oct + Math.floor((li + i) / 7);
    let a = ((tpc + steps[i]) - PC[letter]) % 12; if (a > 6) a -= 12; if (a < -6) a += 12;
    out.push(letter + (a === 1 ? '#' : a === 2 ? '##' : a === -1 ? 'b' : a === -2 ? 'bb' : '') + o);
  }
  return out;
}
function majorScale(tonic, oct) {
  const L = tonic[0].toLowerCase(), alter = tonic.includes('#') ? 1 : tonic.includes('b') ? -1 : 0;
  const li = LETTERS.indexOf(L), tpc = (PC[L] + alter + 12) % 12, steps = [0, 2, 4, 5, 7, 9, 11, 12];
  const out = [];
  for (let i = 0; i < 8; i++) {
    const letter = LETTERS[(li + i) % 7];
    const o = oct + Math.floor((li + i) / 7);
    let a = ((tpc + steps[i]) - PC[letter]) % 12; if (a > 6) a -= 12; if (a < -6) a += 12;
    const acc = a === 1 ? '#' : a === 2 ? '##' : a === -1 ? 'b' : a === -2 ? 'bb' : '';
    out.push(letter + acc + o);
  }
  return out;
}

/* ============================================================
   Technique: scales, arpeggios and chord inversions, generated
   with standard fingering (one octave up and down)
   ============================================================ */
const TECH_TYPES = [
  { id: 'major', name: 'Major scales', short: 'Major scales' },
  { id: 'minor', name: 'Harmonic minor scales', short: 'Minor scales' },
  { id: 'arp', name: 'Arpeggios', short: 'Arpeggios' },
  { id: 'inv', name: 'Chord inversions', short: 'Inversions' }
];
const TECH_KEYS = {
  major: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'],
  minor: ['A', 'E', 'B', 'D', 'G', 'C', 'F'],
  arp: ['C', 'G', 'F', 'Am', 'Em', 'Dm'],
  inv: ['C', 'G', 'D', 'A', 'F', 'Bb']
};
const SCALE_FINGERS = {
  major: { C: ['12312345', '54321321'], G: ['12312345', '54321321'], D: ['12312345', '54321321'], A: ['12312345', '54321321'], E: ['12312345', '54321321'],
    B: ['12312345', '43214321'], 'F#': ['23412312', '43213214'], F: ['12341234', '54321321'], Bb: ['21231234', '32143213'], Eb: ['31234123', '32143213'],
    Ab: ['34123123', '32143213'], Db: ['23123412', '32143213'] },
  minor: { A: ['12312345', '54321321'], E: ['12312345', '54321321'], B: ['12312345', '43214321'], D: ['12312345', '54321321'], G: ['12312345', '54321321'],
    C: ['12312345', '54321321'], F: ['12341234', '54321321'] }
};
function scalePitches(tonic, minor, oct) {
  const alt = keyAlters(minor ? tonic + 'm' : tonic);
  const li = LETTERS.indexOf(tonic[0].toLowerCase()), out = [];
  let o = oct;
  for (let k = 0; k < 8; k++) {
    const letter = LETTERS[(li + k) % 7];
    if (k > 0 && letter === 'c') o++;
    let a = alt[letter] || 0;
    if (minor && k === 6) a += 1;
    out.push(letter + (a === 1 ? '#' : a === 2 ? '##' : a === -1 ? 'b' : a === -2 ? 'bb' : '') + o);
  }
  return out;
}
const octUp = p => p.replace(/(-?\d)$/, d => String(+d + 1));
function lhOct(tonic) { return 'cd'.includes(tonic[0].toLowerCase()) ? 3 : 2; }
function techExercise(type, key, hands) {
  const minor = type === 'minor' || /m$/.test(key);
  const tonic = key.replace(/m$/, '');
  const sigKey = minor ? tonic + 'm' : tonic;
  const name = keyName(sigKey);
  let rh, lh, title, tip, clefSingle = hands === 'lh' ? 'bass' : 'treble';
  if (type === 'major' || type === 'minor') {
    const [fr, fl] = SCALE_FINGERS[type][tonic];
    const seq = (notes, f) => {
      const up = notes.map((p, k) => [p, f[k]]), down = notes.slice(0, 7).reverse().map((p, k) => [p, f[6 - k]]);
      const all = up.concat(down);
      const tok = ([p, fg], k) => p + (k === 0 ? ':q' : k === 14 ? ':h' : '') + '@' + fg;
      const t = all.map(tok);
      return [t.slice(0, 4), t.slice(4, 8), t.slice(8, 12), t.slice(12)].map(b => b.join(' ')).join(' | ') + ' FIN';
    };
    rh = seq(scalePitches(tonic, minor, 4), fr);
    lh = seq(scalePitches(tonic, minor, lhOct(tonic)), fl);
    title = `${name} scale${minor ? ' (harmonic)' : ''}`;
    tip = `Right hand ${fr.split('').join(' ')} going up; left hand ${fl.split('').join(' ')}. Coming down, use the same fingers in reverse. Pass the thumb under smoothly rather than jumping the hand.`;
  } else if (type === 'arp') {
    const s = scalePitches(tonic, minor, 4), l = scalePitches(tonic, minor, lhOct(tonic));
    const arp = (n, f) => `${n[0]}:q@${f[0]} ${n[2]}@${f[1]} ${n[4]}@${f[2]} ${n[7]}@${f[3]} | ${n[4]}@${f[2]} ${n[2]}@${f[1]} ${n[0]}:h@${f[0]} FIN`;
    rh = arp(s, '1235'); lh = arp(l, '5421');
    title = `${name} arpeggio`;
    tip = 'An arpeggio is a chord played one note at a time. Right hand 1 2 3 5, left hand 5 4 2 1. Keep the wrist level and let the hand open, rather than stretching the fingers.';
  } else {
    const ro = 'gab'.includes(tonic[0].toLowerCase()) ? 3 : 4;
    const inv = o => { const s = scalePitches(tonic, false, o), r = s[0], t = s[2], f = s[4];
      return [`(${r} ${t} ${f})`, `(${t} ${f} ${octUp(r)})`, `(${f} ${octUp(r)} ${octUp(t)})`, `(${octUp(r)} ${octUp(t)} ${octUp(f)})`]; };
    const bars = c => `${c[0]}:h ${c[1]} | ${c[2]}:h ${c[3]} | ${c[2]}:h ${c[1]} | ${c[0]}:w FIN`;
    rh = bars(inv(ro)); lh = bars(inv(ro - 1));
    title = `${name}: root position and inversions`;
    tip = 'Root position, first inversion, second inversion, then the top root position. Right hand fingers 1 3 5, 1 2 5, 1 3 5. Left hand 5 3 1, 5 3 1, 5 2 1. Keep all three fingers touching their keys before you press.';
  }
  const spec = hands === 'both' ? { clef: 'grand', key: sigKey, time: '4/4', rh, lh }
    : { clef: clefSingle, key: sigKey, time: '4/4', music: hands === 'lh' ? lh : rh };
  return { title, tip, spec };
}
