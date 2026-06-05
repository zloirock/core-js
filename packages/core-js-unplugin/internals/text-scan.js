// Low-level lexical / text-scanning primitives shared by the text-transform layer
// (transform-queue, polyfill-emitter) and plugin-helpers. No file-scope deps - every
// function takes the source string + a position. Single home for the ECMAScript char-class,
// line-terminator, comment, and astral-surrogate rules so the two scanners can't drift.

// ECMAScript identifier char classes. `$` is a valid identifier char per spec but is NOT in
// `ID_Start` / `ID_Continue`, so it is listed explicitly; `_` is `ID_Start` already but kept
// explicit for symmetry. the `u` flag makes `\p{...}` match by code point, so astral letters
// (tested via `codePointEndingAt`) classify correctly instead of as lone surrogates
export const IDENT_START_RE = /[\p{ID_Start}$_]/u;
export const IDENT_PART_RE = /[\p{ID_Continue}$]/u;

// ES spec LineTerminator: LF / CR / LS (U+2028) / PS (U+2029). per-char check for hot loops
// where a regex-per-test would allocate the match array
export function isLineTerminator(ch) {
  return ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029';
}

// forward-scan past a block comment whose opener is at `p` (caller has verified
// `src[p]==='/' && src[p+1]==='*'`). returns position after `*/`, or `src.length` when the
// comment is unterminated (defensive; parser would have rejected, but raw-text scanners
// upstream of parse must not loop forever)
export function skipBlockComment(src, p) {
  const end = src.indexOf('*/', p + 2);
  return end === -1 ? src.length : end + 2;
}

// JS WhiteSpace + LineTerminator - `\s` covers space / tab / NBSP / FF / VT / BOM / ogham /
// EM / ideographic separators / LF / CR / LS / PS; a 6-char explicit allowlist would miss
// NBSP / BOM / FF / VT etc, treating them as significant
const WS_OR_LT_RE = /\s/;

// scan forward from `pos`, skipping whitespace + line/block comments, to the first non-gap
// char (or `src.length` for an unterminated trailing run). parser-tolerant boundary - source
// can hold `obj ?. (args)`, `obj?./*c*/(args)`, `obj?.// hint\n(args)` between tokens
export function skipGap(src, pos) {
  let p = pos;
  while (p < src.length) {
    const ch = src[p];
    if (WS_OR_LT_RE.test(ch)) {
      p++;
      continue;
    }
    if (ch === '/' && src[p + 1] === '/') {
      while (p < src.length && !isLineTerminator(src[p])) p++;
      continue;
    }
    if (ch === '/' && src[p + 1] === '*') {
      p = skipBlockComment(src, p);
      continue;
    }
    break;
  }
  return p;
}

// the code point ENDING at `i`: pairs a trailing low surrogate with its lead so an astral
// identifier char tests as one unit, not a lone surrogate half (which matches nothing -
// skipping the ASI guard / boundary check and letting an adjacent token fuse incorrectly)
export function codePointEndingAt(str, i) {
  const code = str.charCodeAt(i);
  if (code >= 0xDC00 && code <= 0xDFFF && i > 0) {
    const lead = str.charCodeAt(i - 1);
    if (lead >= 0xD800 && lead <= 0xDBFF) return str.slice(i - 1, i + 1);
  }
  return str[i];
}
