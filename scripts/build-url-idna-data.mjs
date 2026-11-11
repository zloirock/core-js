// Builds the Unicode tables of the `URL` polyfill domain processing from the Unicode Character Database.
// Run it on each update of the Unicode version: `npm run build-url-idna-data`.
// By default the files are downloaded, `UCD_DIR` points to a directory with their local copies.
const UNICODE_VERSION = '18.0.0';
const OUTPUT = 'packages/core-js/internals/url-idna-data.js';
const PUBLIC = `https://www.unicode.org/Public/${ UNICODE_VERSION }`;
const SOURCES = {
  IdnaMappingTable: `${ PUBLIC }/idna/IdnaMappingTable.txt`,
  UnicodeData: `${ PUBLIC }/ucd/UnicodeData.txt`,
  DerivedAge: `${ PUBLIC }/ucd/DerivedAge.txt`,
  DerivedJoiningType: `${ PUBLIC }/ucd/extracted/DerivedJoiningType.txt`,
};
// the oldest Unicode version of a native `String.prototype.normalize`
const NORMALIZE_BASELINE = 6.3;
const CODE_POINTS = 0x110000;
const NEUTRAL = new Set(['ES', 'CS', 'ET', 'ON', 'BN']);
const BIDI_CLASSES = new Set(['L', 'R', 'AL', 'AN', 'EN', 'NSM', ...NEUTRAL]);
// https://url.spec.whatwg.org/#forbidden-domain-code-point
// eslint-disable-next-line regexp/no-control-character -- required
const FORBIDDEN_DOMAIN_CODE_POINT = /[\u0000-\u0020#%/:<>?@[\\\]^|\u007F]/;

async function read(name) {
  const { UCD_DIR } = process.env;
  if (UCD_DIR) return fs.readFile(path.join(UCD_DIR, `${ name }.txt`), 'utf8');
  const response = await fetch(SOURCES[name]);
  if (!response.ok) throw new Error(`${ SOURCES[name] }: ${ response.status }`);
  return response.text();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function * parseRanges(text) {
  for (const line of text.split('\n')) {
    const content = line.split('#')[0].trim();
    if (!content) continue;
    const fields = content.split(';').map(field => field.trim());
    const [first, last = first] = fields[0].split('..');
    yield [parseInt(first, 16), parseInt(last, 16), fields];
  }
}

// --- Sources ---

const [idnaText, unicodeDataText, ageText, joiningText] = await Promise.all(Object.keys(SOURCES).map(read));

const status = new Map();
for (const [first, last, fields] of parseRanges(idnaText)) {
  for (let code = first; code <= last; code++) status.set(code, fields[1]);
}

const age = new Map();
for (const [first, last, fields] of parseRanges(ageText)) {
  for (let code = first; code <= last; code++) age.set(code, parseFloat(fields[1]));
}

const joiningType = new Map();
for (const [first, last, fields] of parseRanges(joiningText)) {
  for (let code = first; code <= last; code++) joiningType.set(code, fields[1]);
}

const category = new Map();
const combiningClass = new Map();
const bidiClass = new Map();
// a combining class, a canonical decomposition or a part of one
const normalizationSensitive = new Set();
// code points taking part in canonical decompositions
const decompositionMembers = new Set();
let rangeStart;
for (const line of unicodeDataText.split('\n')) {
  if (!line) continue;
  const fields = line.split(';');
  const code = parseInt(fields[0], 16);
  if (fields[1].endsWith(', First>')) {
    rangeStart = code;
    continue;
  }
  for (let member = fields[1].endsWith(', Last>') ? rangeStart : code; member <= code; member++) {
    category.set(member, fields[2]);
    combiningClass.set(member, Number(fields[3]));
    bidiClass.set(member, fields[4]);
    if (Number(fields[3])) normalizationSensitive.add(member);
  }
  if (fields[5] && !fields[5].startsWith('<')) {
    for (const member of [code, ...fields[5].split(' ').map(part => parseInt(part, 16))]) {
      normalizationSensitive.add(member);
      decompositionMembers.add(member);
    }
  }
}

// --- Code points of validated labels ---

function isValid(code) {
  const value = status.get(code);
  assert(value, `no IDNA status for U+${ code.toString(16) }`);
  return value === 'valid' || value === 'deviation';
}

// ASCII is handled by the code of the polyfill
const universe = [];
for (let code = 0x80; code < CODE_POINTS; code++) if (isValid(code)) universe.push(code);
const position = new Map(universe.map((code, index) => [code, index]));

for (let code = 0; code < 0x80; code++) {
  const character = String.fromCharCode(code);
  const uppercase = code >= 0x41 && code <= 0x5A;
  assert(status.get(code) === (uppercase ? 'mapped' : 'valid'), `unexpected IDNA status of ASCII ${ code }`);
  if (uppercase || FORBIDDEN_DOMAIN_CODE_POINT.test(character)) continue;
  const expected = /\d/.test(character) ? 'EN' : /[a-z]/.test(character) ? 'L' : 'N';
  const actual = NEUTRAL.has(bidiClass.get(code)) ? 'N' : bidiClass.get(code);
  assert(actual === expected, `unexpected Bidi_Class of ASCII ${ code }`);
}

for (const code of universe) {
  assert(BIDI_CLASSES.has(bidiClass.get(code)), `Bidi_Class ${ bidiClass.get(code) } is not handled by the Bidi rule`);
  if (bidiClass.get(code) !== 'NSM') continue;
  // the tables of marks and transparent code points hold only the difference with NSM
  assert(category.get(code).startsWith('M'), `NSM U+${ code.toString(16) } is not a mark`);
  assert(joiningType.get(code) === 'T', `NSM U+${ code.toString(16) } is not transparent`);
}

// the polyfill skips the lookups below these code points
assert(universe.every(code => code > 0x58F || !['R', 'AL', 'AN'].includes(bidiClass.get(code))), 'a right-to-left code point below U+0590');
assert(universe.every(code => code > 0x2FF || !category.get(code).startsWith('M')), 'a mark below U+0300');

// --- Packing ---

// Ranges of the members. A range may span code points outside the universe: those are rejected before a lookup.
function toRanges(members, bridge = true) {
  const ranges = [];
  for (const code of members) {
    const range = ranges.at(-1);
    if (range && (code === range[1] + 1 || bridge && position.get(code) === position.get(range[1]) + 1)) range[1] = code;
    else ranges.push([code, code]);
  }
  return ranges;
}

// Distances between the code points where the membership changes, as base 26 numbers:
// lowercase letters are the leading digits, an uppercase letter is the last one.
function pack(ranges) {
  let result = '';
  let previous = 0;
  for (const [first, last] of ranges) {
    for (let distance of [first - previous, last + 1 - first]) {
      let digits = String.fromCharCode(65 + distance % 26);
      while (distance >= 26) {
        distance = Math.floor(distance / 26);
        digits = String.fromCharCode(97 + distance % 26) + digits;
      }
      result += digits;
    }
    previous = last + 1;
  }
  return result;
}

// the algorithms of the polyfill, for the self-check
function unpack(packed) {
  const result = [];
  let value = 0;
  let code = 0;
  for (let index = 0; index < packed.length; index++) {
    const digit = packed.charCodeAt(index);
    if (digit > 96) value = value * 26 + digit - 97;
    else {
      result.push(code += value * 26 + digit - 65);
      value = 0;
    }
  }
  return result;
}

function has(boundaries, code) {
  let low = 0;
  let high = boundaries.length;
  while (low < high) {
    const middle = low + high >> 1;
    if (boundaries[middle] > code) high = middle;
    else low = middle + 1;
  }
  return low % 2 === 1;
}

function table(test, bridge) {
  const members = new Set(universe.filter(test));
  const packed = pack(toRanges(members, bridge));
  const unpacked = unpack(packed);
  for (let code = bridge === false ? 0x80 : 0; code < CODE_POINTS; code++) {
    if (bridge === false || position.has(code)) assert(has(unpacked, code) === members.has(code), `wrong lookup of U+${ code.toString(16) }`);
  }
  return packed;
}

// --- Tables ---

const tables = {
  valid: table(() => true, false),
  bidiR: table(code => bidiClass.get(code) === 'R' || bidiClass.get(code) === 'AL'),
  bidiAN: table(code => bidiClass.get(code) === 'AN'),
  bidiEN: table(code => bidiClass.get(code) === 'EN'),
  bidiNSM: table(code => bidiClass.get(code) === 'NSM'),
  bidiNeutral: table(code => NEUTRAL.has(bidiClass.get(code))),
  mark: table(code => category.get(code).startsWith('M') && bidiClass.get(code) !== 'NSM'),
  transparent: table(code => joiningType.get(code) === 'T' && bidiClass.get(code) !== 'NSM'),
  joiningL: table(code => joiningType.get(code) === 'L'),
  joiningR: table(code => joiningType.get(code) === 'R'),
  joiningD: table(code => joiningType.get(code) === 'D'),
  virama: table(code => combiningClass.get(code) === 9),
};

// Normalization-sensitive code points by the Unicode version that added them, with a sentinel of each version:
// a combining mark that reorders only when the native normalization knows it.
const versions = [...new Set(universe.filter(code => normalizationSensitive.has(code)).map(code => age.get(code)))]
  .filter(version => version > NORMALIZE_BASELINE)
  .sort((a, b) => a - b);
const sentinels = versions.map(version => {
  const sentinel = universe.find(code => age.get(code) === version && combiningClass.get(code) && !decompositionMembers.has(code));
  assert(sentinel, `no normalization sentinel for Unicode ${ version }`);
  return sentinel;
});
const sensitive = versions.map(version => table(code => normalizationSensitive.has(code) && age.get(code) === version));

// --- Output ---

function escape(code) {
  return String.fromCodePoint(code).split('')
    .map(unit => `\\u${ unit.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') }`).join('');
}

const lines = [
  "'use strict';",
  `// Generated by scripts/build-url-idna-data.mjs from the Unicode Character Database ${ UNICODE_VERSION }, do not edit.`,
  '// Each table holds the distances between the code points where the membership changes, as base 26 numbers:',
  '// lowercase letters are the leading digits, an uppercase letter is the last one.',
  '// All tables but `valid` are defined only on the code points of `valid`.',
  '/* eslint-disable @stylistic/max-len -- generated data */',
  'module.exports = {',
  ...Object.entries(tables).map(([name, packed]) => `  ${ name }: '${ packed }',`),
  '  // normalization-sensitive code points by the Unicode version that added them, from the oldest one',
  '  sensitive: [',
  sensitive.map(packed => `    '${ packed }'`).join(',\n'),
  '  ],',
  '  // a combining mark of each of those versions',
  '  sentinels: [',
  sentinels.map(code => `    '${ escape(code) }'`).join(',\n'),
  '  ]',
  '};',
  '',
];

await fs.writeFile(OUTPUT, lines.join('\n'));

const size = Object.values(tables).concat(sensitive).reduce((sum, packed) => sum + packed.length, 0);
echo(chalk.green(`URL IDNA data for Unicode ${ chalk.cyan(UNICODE_VERSION) } built: ${ chalk.cyan(size) } bytes in tables, \
${ chalk.cyan(versions.join(', ')) } as normalization versions`));
