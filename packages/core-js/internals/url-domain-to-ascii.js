'use strict';
var uncurryThis = require('../internals/function-uncurry-this-clause');
var punycode = require('../internals/string-punycode');
var data = require('../internals/url-idna-data');

var fromCharCode = String.fromCharCode;
var fromCodePoint = punycode.ucs2encode;
var toCodePoints = punycode.ucs2decode;
// captured on load, checked by behavior on the first use
// eslint-disable-next-line es/no-string-prototype-normalize -- safe
var normalize = uncurryThis(''.normalize);
var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var exec = uncurryThis(/./.exec);
var join = uncurryThis([].join);
var push = uncurryThis([].push);
var split = uncurryThis(''.split);
var stringIndexOf = uncurryThis(''.indexOf);
var stringSlice = uncurryThis(''.slice);
var toLowerCase = uncurryThis(''.toLowerCase);

// eslint-disable-next-line regexp/no-control-character -- safe
var NON_ASCII = /[^\u0000-\u007F]/;
var SEPARATORS = /[.\u3002\uFF0E\uFF61]/;
// Mathematical Latin letters encoded in Letterlike Symbols, with their UTS#46 mappings.
var MATH_LATIN_CHARACTERS = '\u2102\u2107\u210A\u210B\u210C\u210D\u210E\u210F\u2110\u2111\u2112\u2113\u2115'
  + '\u2119\u211A\u211B\u211C\u211D\u2124\u2128\u212C\u212D\u212F\u2130\u2131'
  + '\u2133\u2134\u2139\u2145\u2146\u2147\u2148\u2149';
var MATH_LATIN_MAPPING = 'c\u025Bghhhh\u0127iillnpqrrrzzbceefmoiddeij';
var CYRILLIC_MAPPING = '\u0432\u0434\u043E\u0441\u0442\u0442\u044A\u0463\uA64B';
// Supplementary capitals that older engines do not lowercase: the first one, the last one, the distance.
var SUPPLEMENTARY_CAPITALS = [
  [0x10400, 0x10427, 0x28], // Deseret
  [0x104B0, 0x104D3, 0x28], // Osage
  [0x10C80, 0x10CB2, 0x40], // Old Hungarian
  [0x118A0, 0x118BF, 0x20], // Warang Citi
  [0x1E900, 0x1E921, 0x22] // Adlam
];
// Bidi classes: R holds R and AL, NEUTRAL holds ES, CS, ET, ON and BN
var L = 0;
var R = 1;
var AN = 2;
var EN = 3;
var NSM = 4;
var NEUTRAL = 5;

var tables = {};
// tables of normalization-sensitive code points newer than the native normalization
var untrusted = [];
var NFC_SUPPORT = false;
var NFKC_SUPPORT = false;
var initialized = false;

// the format is described in the data module
var unpack = function (packed) {
  var result = [];
  var value = 0;
  var code = 0;
  var index = 0;
  var digit;
  for (; index < packed.length; index++) {
    digit = charCodeAt(packed, index);
    if (digit > 96) value = value * 26 + digit - 97;
    else {
      push(result, code += value * 26 + digit - 65);
      value = 0;
    }
  }
  return result;
};

var inTable = function (table, code) {
  var low = 0;
  var high = table.length;
  var middle;
  while (low < high) {
    middle = low + high >> 1;
    if (table[middle] > code) high = middle;
    else low = middle + 1;
  }
  return low % 2 === 1;
};

var has = function (name, code) {
  return inTable(tables[name] || (tables[name] = unpack(data[name])), code);
};

var initialize = function () {
  var index = 0;
  initialized = true;
  // a stub returns its argument, so the forms are checked separately and by the result
  if (!normalize) return;
  NFC_SUPPORT = normalize('A\u030A', 'NFC') === '\u00C5';
  NFKC_SUPPORT = normalize('\uFB03', 'NFKC') === 'ffi';
  if (NFC_SUPPORT) for (; index < data.sentinels.length; index++) {
    // a combining mark known to the normalization is reordered with the marks around it
    if (charAt(normalize('\u0301' + data.sentinels[index] + '\u0316', 'NFC'), 0) === '\u0301') {
      push(untrusted, unpack(data.sensitive[index]));
    }
  }
};

// IDNA status valid or deviation, https://www.unicode.org/reports/tr46/#IDNA_Mapping_Table
var isValid = function (code) {
  return code < 0x80 ? code < 0x41 || code > 0x5A : has('valid', code);
};

var isIgnored = function (code) {
  return code === 0xAD || code === 0x34F || code === 0x200B || code === 0x3164
    || code === 0xFEFF || code === 0xFFA0
    || (code >= 0x115F && code <= 0x1160)
    || (code >= 0x17B4 && code <= 0x17B5)
    || (code >= 0x180B && code <= 0x180F)
    || (code >= 0x2060 && code <= 0x2064) || (code >= 0x206A && code <= 0x206F)
    || (code >= 0xFE00 && code <= 0xFE0F)
    || (code >= 0x1BCA0 && code <= 0x1BCA3)
    || (code >= 0x1D173 && code <= 0x1D17A)
    || (code >= 0xE0100 && code <= 0xE01EF);
};

// Unassigned positions of the mathematical Latin alphabets, which the mapping below would turn into letters.
var isUnassignedMathematical = function (code) {
  switch (code) {
    case 0x1D455: case 0x1D49D: case 0x1D4A0: case 0x1D4A1:
    case 0x1D4A3: case 0x1D4A4: case 0x1D4A7: case 0x1D4A8:
    case 0x1D4AD: case 0x1D4BA: case 0x1D4BC: case 0x1D4C4:
    case 0x1D506: case 0x1D50B: case 0x1D50C: case 0x1D515:
    case 0x1D51D: case 0x1D53A: case 0x1D53F: case 0x1D545:
    case 0x1D547: case 0x1D548: case 0x1D549: case 0x1D551:
      return true;
  } return false;
};

// The mapping of a code point that is neither valid nor ignored. It covers what the native normalization
// and case mapping miss or do not know yet; a result that is still not valid is rejected by the validation.
var mapCodePoint = function (code, character) {
  var index, range;
  // Mathematical Latin alphabets repeat A-Z / a-z.
  if (code >= 0x1D400 && code <= 0x1D6A3) return fromCharCode(0x61 + (code - 0x1D400) % 26);
  // Mathematical bold, double-struck, sans-serif, sans-serif bold, and monospace digits.
  if (code >= 0x1D7CE && code <= 0x1D7FF) return fromCharCode(0x30 + (code - 0x1D7CE) % 10);
  // Additional mathematical Latin letters, including the missing alphabet positions.
  if (code >= 0x2102 && code <= 0x2149) {
    index = stringIndexOf(MATH_LATIN_CHARACTERS, character);
    if (index !== -1) return charAt(MATH_LATIN_MAPPING, index);
  }
  // full-width forms
  if (code >= 0xFF01 && code <= 0xFF5E) return toLowerCase(fromCharCode(code - 0xFEE0));
  // Cherokee case folding uses capitals, unlike lowercasing
  if (code >= 0x13F8 && code <= 0x13FD) return fromCharCode(code - 8);
  if (code >= 0xAB70 && code <= 0xABBF) return fromCharCode(code - 0x97D0);
  // Georgian capitals, which some engines lowercase to Mkhedruli instead of Nuskhuri
  if (code >= 0x10A0 && code <= 0x10CD) return fromCharCode(code + 0x1C60);
  // historic Cyrillic letters
  if (code >= 0x1C80 && code <= 0x1C88) return charAt(CYRILLIC_MAPPING, code - 0x1C80);
  // Greek ypogegrammeni / prosgegrammeni expands to a separate iota
  if (code >= 0x1F80 && code <= 0x1FAF) {
    return fromCharCode((code & 7) + (code < 0x1F90 ? 0x1F00 : code < 0x1FA0 ? 0x1F20 : 0x1F60)) + '\u03B9';
  }
  if (code > 0xFFFF) for (index = 0; index < SUPPLEMENTARY_CAPITALS.length; index++) {
    range = SUPPLEMENTARY_CAPITALS[index];
    if (code >= range[0] && code <= range[1]) return fromCodePoint(code + range[2]);
  }
  switch (code) {
    // Mathematical italic dotless i / j and the Unicode 18 long s ligature.
    case 0x1D6A4: return '\u0131';
    case 0x1D6A5: return '\u0237';
    case 0x1D6A6: return 'ss';
    case 0x345: return '\u03B9';
    // some engines lowercase these two capitals to other letters
    case 0x130: return 'i\u0307';
    case 0x18E: return '\u01DD';
    // old V8 lowercases even an isolated capital sigma to final sigma
    case 0x3A3: return '\u03C3';
    case 0x1FB2: return '\u1F70\u03B9';
    case 0x1FB3: case 0x1FBC: return '\u03B1\u03B9';
    case 0x1FB4: return '\u03AC\u03B9';
    case 0x1FB7: return '\u1FB6\u03B9';
    case 0x1FC2: return '\u1F74\u03B9';
    case 0x1FC3: case 0x1FCC: return '\u03B7\u03B9';
    case 0x1FC4: return '\u03AE\u03B9';
    case 0x1FC7: return '\u1FC6\u03B9';
    case 0x1FF2: return '\u1F7C\u03B9';
    case 0x1FF3: case 0x1FFC: return '\u03C9\u03B9';
    case 0x1FF4: return '\u03CE\u03B9';
    case 0x1FF7: return '\u1FF6\u03B9';
  }
  // Lowercase each code point independently, without the Final_Sigma context.
  return toLowerCase(character);
};

// https://www.unicode.org/reports/tr46/#ProcessingStepMap
// `null` for a code point that must not be mapped: an unassigned position of the mathematical alphabets
// or a compatibility character that brings a label separator
var mapDomain = function (domain) {
  var codePoints = toCodePoints(domain);
  var result = '';
  var index = 0;
  var code, character, compatible, pieces, pieceIndex, piece;
  for (; index < codePoints.length; index++) {
    code = codePoints[index];
    character = fromCodePoint(code);
    if (code < 0x80) result += toLowerCase(character);
    // valid code points and deviations stay as they are, whatever the engine knows about them
    else if (has('valid', code)) result += character;
    else if (isIgnored(code)) continue;
    else if (code === 0x3002 || code === 0xFF0E || code === 0xFF61) result += '.';
    else if (isUnassignedMathematical(code)) return null;
    else {
      // old JavaScriptCore returns a Latin-1 string as it is, so such a code point is normalized with a wider one
      compatible = !NFKC_SUPPORT ? character
        : code < 0x100 ? stringSlice(normalize(character + '\u4E00', 'NFKC'), 0, -1)
        : normalize(character, 'NFKC');
      if (compatible === character) result += mapCodePoint(code, character);
      else {
        if (exec(SEPARATORS, compatible)) return null;
        pieces = toCodePoints(compatible);
        for (pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
          piece = pieces[pieceIndex];
          // a final sigma that is not in the input is a compatibility variant of sigma
          result += piece === 0x3C2 ? '\u03C3' : isValid(piece) ? fromCodePoint(piece) : mapCodePoint(piece, fromCodePoint(piece));
        }
      }
    }
  }
  return result;
};

var isTransparent = function (code) {
  return has('bidiNSM', code) || has('transparent', code);
};

// https://www.rfc-editor.org/rfc/rfc5892.html#appendix-A.1
// https://www.rfc-editor.org/rfc/rfc5892.html#appendix-A.2
var checkJoiners = function (codePoints) {
  var length = codePoints.length;
  var index = 0;
  var code, cursor;
  for (; index < length; index++) {
    code = codePoints[index];
    if (code !== 0x200C && code !== 0x200D) continue;
    if (index && has('virama', codePoints[index - 1])) continue;
    if (code === 0x200D) return false;
    for (cursor = index - 1; cursor >= 0 && isTransparent(codePoints[cursor]);) cursor--;
    if (cursor < 0 || !(has('joiningL', codePoints[cursor]) || has('joiningD', codePoints[cursor]))) return false;
    for (cursor = index + 1; cursor < length && isTransparent(codePoints[cursor]);) cursor++;
    if (cursor === length || !(has('joiningR', codePoints[cursor]) || has('joiningD', codePoints[cursor]))) return false;
  }
  return true;
};

// https://www.unicode.org/reports/tr46/#Validity_Criteria
// with the URL Standard parameters, without the Bidi rule, which needs the whole domain
var isValidLabel = function (codePoints) {
  var length = codePoints.length;
  var index = 0;
  var code, guard;
  for (; index < length; index++) {
    code = codePoints[index];
    if (!isValid(code)) return false;
    for (guard = 0; guard < untrusted.length; guard++) {
      if (inTable(untrusted[guard], code)) return false;
    }
  }
  code = codePoints[0];
  // General_Category=Mark
  return !(code > 0x2FF && (has('bidiNSM', code) || has('mark', code))) && checkJoiners(codePoints);
};

var bidiClass = function (code) {
  if (code < 0x80) return code > 0x60 && code < 0x7B ? L : code > 0x2F && code < 0x3A ? EN : NEUTRAL;
  return has('bidiR', code) ? R
    : has('bidiAN', code) ? AN
    : has('bidiEN', code) ? EN
    : has('bidiNSM', code) ? NSM
    : has('bidiNeutral', code) ? NEUTRAL
    : L;
};

// https://www.rfc-editor.org/rfc/rfc5893.html#section-2
var checkBidi = function (codePoints) {
  var first = bidiClass(codePoints[0]);
  var rtl = first === R;
  var last = first;
  var hasEN = false;
  var hasAN = false;
  var index = 0;
  var type;
  if (!rtl && first !== L) return false;
  for (; index < codePoints.length; index++) {
    type = bidiClass(codePoints[index]);
    if (type === NSM) continue;
    if (type === EN) hasEN = true;
    else if (type === AN) hasAN = true;
    if (rtl ? type === L : type === R || type === AN) return false;
    last = type;
  }
  return rtl ? (last === R || last === EN || last === AN) && !(hasEN && hasAN) : last === L || last === EN;
};

// https://url.spec.whatwg.org/#concept-domain-to-ascii
// UTS#46 processing with the URL Standard parameters over the native normalization and case mapping.
// The mapping and normalization tables are too large to ship, so what the engine does not provide
// is rejected rather than converted to another host. Code points, marks, joiners and the Bidi rule
// are validated against Unicode tables shipped with the polyfill.
// Not covered:
// - in engines without `String.prototype.normalize`, domains are not normalized and compatibility
//   characters outside the mapping above are rejected;
// - mapped code points and normalization-sensitive code points newer than the Unicode version
//   of the engine are rejected.
module.exports = function (domain) {
  var labels, validated, index, label, codePoints, bidi, cursor, code, encoded;
  // an ASCII domain only needs lowercasing, whatever its Punycode labels hold
  if (!exec(NON_ASCII, domain)) return domain === '' ? null : toLowerCase(domain);
  if (!initialized) initialize();
  domain = mapDomain(domain);
  if (domain === null) return null;
  if (NFC_SUPPORT) domain = normalize(domain, 'NFC');
  labels = split(domain, '.');
  validated = [];
  bidi = false;
  for (index = 0; index < labels.length; index++) {
    label = labels[index];
    if (stringSlice(label, 0, 4) === 'xn--') {
      if (exec(NON_ASCII, label)) return null;
      label = punycode.decode(stringSlice(label, 4));
      if (label === null || !exec(NON_ASCII, label) || stringSlice(label, 0, 4) === 'xn--') return null;
      if (NFC_SUPPORT && normalize(label, 'NFC') !== label) return null;
    }
    codePoints = toCodePoints(label);
    if (!isValidLabel(codePoints)) return null;
    for (cursor = 0; !bidi && cursor < codePoints.length; cursor++) {
      code = codePoints[cursor];
      // the first right-to-left code point is U+0590
      bidi = code > 0x58F && (has('bidiR', code) || has('bidiAN', code));
    }
    if (exec(NON_ASCII, label)) {
      encoded = punycode.encode(label);
      if (encoded === null) return null;
      label = 'xn--' + encoded;
    }
    labels[index] = label;
    push(validated, codePoints);
  }
  // a domain with a right-to-left label is a Bidi domain name, its every label follows the Bidi rule
  if (bidi) for (index = 0; index < validated.length; index++) {
    if (validated[index].length && !checkBidi(validated[index])) return null;
  }
  domain = join(labels, '.');
  return domain === '' ? null : domain;
};
