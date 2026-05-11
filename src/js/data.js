/* ─── DATA LAYER ─────────────────────────────────────────────
   Single source of truth for all content and configuration.
   Import named DATA wherever needed.
   ─────────────────────────────────────────────────────────── */
export const DATA = Object.freeze({

  pseudoChars: Object.freeze([
    '囗','囚','囤','囥','囦','囧','囨','囩','囪','囫','囬','园','囮','囯',
    '困','囱','囲','図','围','囵','囶','囷','囸','囹','固','囻','囼','图',
    '囿','圀','圁','圂','圃','圄','圅','圆','圇','圈','圉','圊','國','圌',
    '圍','圎','圏','圐',
  ]),

  realChars:   Object.freeze(['人','山','水','火','木','金','土','日','月','風','雲','龍','鳳','虎','龜']),
  hybridChars: Object.freeze(['囧','囨','囬','囯','図','囼','圀','圁','圂','圃']),
  strokeChars: Object.freeze(['一','二','三','丨','丩','个','丫','丬']),

  glyphCategories: Object.freeze([
    {
      key:   'pseudo',
      label: 'Pseudo-Character',
      desc:  'Structurally coherent, semantically void. Looks like a real character — maps to nothing.',
      bank:  'pseudoChars',
    },
    {
      key:   'real',
      label: 'Real Character',
      desc:  'A genuine Chinese character with semantic content. The reading apparatus completes its cycle.',
      bank:  'realChars',
    },
    {
      key:   'hybrid',
      label: 'Hybrid Form',
      desc:  'Ambiguous — activates multiple recognition pathways simultaneously. Neither fully real nor fully pseudo.',
      bank:  'hybridChars',
    },
    {
      key:   'stroke',
      label: 'Stroke Layer',
      desc:  'Sub-lexical component. A stroke or radical: the atoms from which characters are assembled.',
      bank:  'strokeChars',
    },
  ]),

  squareWords: Object.freeze({
    TREE:   '木',
    WATER:  '水',
    FIRE:   '火',
    EARTH:  '土',
    SKY:    '天',
    BOOK:   '書',
    PERSON: '人',
    MOUTH:  '口',
  }),

  sectionIds: Object.freeze([
    'hero','artist','foyer','room-sky','room-english',
    'room-square','glyph-tool','timeline','theory',
    'ar-panel','provenance',
  ]),

  /** YOU ARE HERE — all 11 sections tracked (P2 fix: was only 4) */
  roomMeta: Object.freeze({
    'hero':         { label: 'Entry',                               color: '#bf2929' },
    'artist':       { label: 'Artist Profile',                      color: '#c8bba8' },
    'foyer':        { label: 'Navigation Foyer',                    color: '#c8bba8' },
    'room-sky':     { label: 'Room 01 — Book from the Sky',         color: '#bf2929' },
    'room-english': { label: 'Room 02 — New English Calligraphy',   color: '#c9a356' },
    'room-square':  { label: 'Room 03 — Square Word Calligraphy',   color: '#3a8c8c' },
    'glyph-tool':   { label: 'Glyph Engine',                        color: '#7a5cbf' },
    'timeline':     { label: 'Timeline',                            color: '#c8bba8' },
    'theory':       { label: 'Theoretical Frame',                   color: '#c8bba8' },
    'ar-panel':     { label: 'AR Integration',                      color: '#c8bba8' },
    'provenance':   { label: 'Provenance',                          color: '#c8bba8' },
  }),
});
