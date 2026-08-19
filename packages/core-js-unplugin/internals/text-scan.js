// Lexical layer of the text emitter: the ECMAScript char classes, the gap (trivia) scans and
// the ONE tokenizer every lexer-aware walk over source or emitted text rides - the region map
// (`literalRegionsOf`), the backward significant-char scan (`prevSignificantPos`), the paren
// walks, the ref-canon identifier sweep. no file-scope deps: every function takes the text + a
// position, so the scanners cannot drift from each other.
//
// the tokenizer is heuristic by necessity (it runs on fragments of emitted text, which have no
// AST): regex-vs-division, block-vs-object `{` and JSX-vs-comparison `<` are decided from the
// previous significant token and a small mode stack, the way a highlighter does. the ONE place
// that rule is written is `scanTokens` below; what a consumer gets wrong, it gets wrong here

// ECMAScript identifier char classes. neither `$` nor `_` is in Unicode `ID_Start`, so both are
// added explicitly to the start class; `_` IS in `ID_Continue` (hence `IDENT_PART_RE` omits it),
// `$` is in neither (so `IDENT_PART_RE` adds it); ZWNJ / ZWJ are IdentifierPartChar by the spec
// but not `ID_Continue`. the `u` flag makes `\p{...}` match by code point, so astral letters
// (tested via `codePointEndingAt`) classify correctly instead of as lone surrogates
export const IDENT_START_RE = /[\p{ID_Start}$_]/u;
export const IDENT_PART_RE = /[\p{ID_Continue}$\u{200C}\u{200D}]/u;

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

// WhiteSpace WITHOUT the line terminators - what an inter-token scan that must STOP at the end
// of a line skips. spelled here rather than at the call site so the two-char `' '`/`'\t'` pair
// cannot drift from the class above: `\f`, `\v`, NBSP and BOM are WhiteSpace and separate a
// statement from its trailing comment exactly as a space does
export function isInlineWhitespace(ch) {
  return ch !== undefined && WS_OR_LT_RE.test(ch) && !isLineTerminator(ch);
}

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

// the line-bounded twin of `skipGap`: skip inline whitespace and comments from `pos` but STOP at
// the line terminator that ends the current line (the returned position is that terminator, the
// first code char, or `src.length`). a line comment runs to the terminator; a block comment is
// one token even when it crosses lines, so the gap continues after it
export function skipInlineGap(src, pos) {
  let p = pos;
  for (;;) {
    while (isInlineWhitespace(src[p])) p++;
    if (src[p] === '/' && src[p + 1] === '/') {
      while (p < src.length && !isLineTerminator(src[p])) p++;
      return p;
    }
    if (src[p] === '/' && src[p + 1] === '*') {
      p = skipBlockComment(src, p);
      continue;
    }
    return p;
  }
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

// the code point STARTING at `i` - the forward twin, for a needle's own first char; `''` past the end
export function codePointStartingAt(str, i) {
  return i < str.length ? String.fromCodePoint(str.codePointAt(i)) : '';
}

// is the `?.` at `pos` the OptionalChainingPunctuator? the grammar keeps `?.` out of
// `c?.5:1` (a conditional over the numeric literal `.5`) by a DecimalDigit lookahead - every
// reader of the punctuator asks this instead of `startsWith('?.')`
export function isOptionalChainAt(src, pos) {
  return src[pos] === '?' && src[pos + 1] === '.' && !(src[pos + 2] >= '0' && src[pos + 2] <= '9');
}

// --- tokenizer ---

// the dialect the text is lexed in. `jsx` admits JSX (a `<` in expression position opens a tag,
// and the element's text / attribute strings are regions, not code) - set by the file's
// extension, exactly the rule the parser applies; `script` admits the Annex B HTML-like
// comments (`<!--` anywhere, `-->` at the start of a line), which only a Script goal has.
// held at module level for the duration of one transform: every lexer-aware walk over the
// file's text, or over text composed from it, asks the same question, and threading a dialect
// argument through all of them buys nothing - one file, one dialect, set and restored around
// the transform by the plugin
let currentDialect = { jsx: false, script: false };
export function setLexDialect(dialect) {
  const previous = currentDialect;
  currentDialect = { jsx: !!dialect?.jsx, script: !!dialect?.script };
  return previous;
}

// keywords after which an EXPRESSION starts: a `/` opens a regex literal, a `{` an object
// literal, a `<` a JSX tag
const EXPRESSION_KEYWORDS = new Set([
  'await', 'case', 'default', 'delete', 'do', 'else', 'in', 'instanceof', 'new', 'of', 'return', 'throw', 'typeof',
  'void', 'yield',
]);
// `return` / `throw` / `yield` end their statement at a line terminator (the restricted
// productions), so what follows on the next line is a statement start, not their operand
const NO_LINE_TERMINATOR_AFTER = new Set(['return', 'throw', 'yield']);
// `if` / `for` / `while` / `with` open a paren whose closer ends a HEAD, not a value: a `/`
// after it is a regex, a `{` a block
const HEAD_PAREN_KEYWORDS = new Set(['for', 'if', 'while', 'with']);
// a `{` after these opens a block whatever else the token would say
const BLOCK_KEYWORDS = new Set(['do', 'else', 'finally', 'try']);

// the previous-significant-token register. a punctuator and a keyword stand for themselves
// (their text); every other token, and the punctuator shapes whose text alone would answer
// wrong, stand as a marker
const PREV_NONE = '';
const PREV_VALUE = '?Value';
const PREV_HEAD_PAREN_END = '?HeadParenEnd';
// the `)` closing a function's parameter list - of a function EXPRESSION (its body's `}` ends a
// value: `x = function () {} / 2` divides) or of a declaration (its `}` ends a statement)
const PREV_FN_EXPR_PARAMS_END = '?FnExprParamsEnd';
const PREV_FN_DECL_PARAMS_END = '?FnDeclParamsEnd';
const PREV_POSTFIX = '?Postfix';
const PREV_UNARY_INC_DEC = '?UnaryIncDec';
const PREV_TEMPLATE_HOLE = '?TemplateHole';
const PREV_JSX_HOLE = '?JsxHole';
const PREV_RESTRICTED_LINE_BREAK = '?RestrictedLineBreak';

// does an EXPRESSION start after this previous token? a value and the punctuators that end
// one (`)` `]` postfix `++`) say no; an operator, an opener, a separator, an expression
// keyword and a statement boundary say yes
function precedesExpression(prev) {
  switch (prev) {
    case PREV_NONE: case PREV_HEAD_PAREN_END: case PREV_UNARY_INC_DEC: case PREV_TEMPLATE_HOLE:
    case PREV_JSX_HOLE: case PREV_RESTRICTED_LINE_BREAK: return true;
    case PREV_VALUE: case PREV_POSTFIX: case ')': case ']': return false;
    // a member accessor is followed by a NAME, never by an operand; a parameter list by its body
    case '.': case '?.': case PREV_FN_EXPR_PARAMS_END: case PREV_FN_DECL_PARAMS_END: return false;
  }
  if (/^[\p{ID_Start}$_]/u.test(prev)) return EXPRESSION_KEYWORDS.has(prev) || BLOCK_KEYWORDS.has(prev);
  // every remaining punctuator precedes an operand - the operators, `(` `[` `{` `}` (a block's
  // end) `,` `;` `:` `?` `=>` `...` `?.`
  return true;
}

// does a `{` after this previous token open a BLOCK (statement list) rather than an object
// literal? a block follows a statement boundary, an arrow, a head paren's closer, a function's
// parameter list, a block keyword; an object follows an operator, an opener, `return`
function opensBlock(prev) {
  switch (prev) {
    case PREV_NONE: case PREV_HEAD_PAREN_END: case PREV_RESTRICTED_LINE_BREAK: case ')': case ']':
    case ';': case '{': case '}': case '=>': case PREV_FN_EXPR_PARAMS_END: case PREV_FN_DECL_PARAMS_END: return true;
    case PREV_TEMPLATE_HOLE: case PREV_JSX_HOLE: return false;
  }
  if (BLOCK_KEYWORDS.has(prev)) return true;
  return !precedesExpression(prev);
}

// is a `function` after this previous token an EXPRESSION? at a statement boundary (the start,
// `;`, a block's braces, a label's or case's `:`, a head paren's closer, `else` / `do`, `export
// default`) it is a declaration; after an operator, an opener, a separator or `return` an expression
function functionIsExpressionAfter(prev) {
  switch (prev) {
    case PREV_NONE: case ';': case '{': case '}': case ':': case PREV_HEAD_PAREN_END:
    case PREV_RESTRICTED_LINE_BREAK: case 'default': return false;
  }
  return !BLOCK_KEYWORDS.has(prev) && precedesExpression(prev);
}

// does the `}` of a `{` opened after this previous token end a VALUE? an object literal's does,
// and so does a function EXPRESSION's body and an arrow's body (`x = () => {} / 2` divides) -
// blocks inside, a value outside; a declaration's body, a control body and a bare block end a
// statement (a `/` after them opens a regex)
function closesValue(prev) {
  return prev === '=>' || prev === PREV_FN_EXPR_PARAMS_END || !opensBlock(prev);
}

const WS_RE = /[\p{Zs}\t\v\f\u{FEFF}]+/uy;
const LINE_TERMINATOR_RE = /\r\n|[\n\r\u2028\u2029]/y;
const LINE_TERMINATOR_TEST_RE = /[\n\r\u2028\u2029]/;
const LINE_COMMENT_RE = /\/\/[^\n\r\u2028\u2029]*/y;
const HTML_OPEN_COMMENT_RE = /<!--[^\n\r\u2028\u2029]*/y;
const HTML_CLOSE_COMMENT_RE = /-->[^\n\r\u2028\u2029]*/y;
const IDENT_RE = /#?(?:[\p{ID_Start}$_]|\\u(?:[\dA-Fa-f]{4}|\{[\dA-Fa-f]+\}))(?:[\p{ID_Continue}$\u{200C}\u{200D}]|\\u(?:[\dA-Fa-f]{4}|\{[\dA-Fa-f]+\}))*/uy;
const NUMBER_RE = /(?:0[Xx][\dA-Fa-f](?:_?[\dA-Fa-f])*|0[Oo][0-7](?:_?[0-7])*|0[Bb][01](?:_?[01])*)n?|0n|[1-9](?:_?\d)*n|(?:(?:0(?!\d)|0\d*[89]\d*|[1-9](?:_?\d)*)(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[Ee][+-]?\d(?:_?\d)*)?|0[0-7]+/y;
// `?.` is the optional-chaining punctuator only without a DecimalDigit after it (and a plain `.`
// followed by a digit is the start of a numeric literal); `/` is listed only as a division
// operator - a regex is tried first, where one may stand
const PUNCT_RE = /--|\+\+|=>|\.{3}|\?\.(?!\d)|\.(?!\d)|(?:&&|\|\||\?\?|[%&+\-^|]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2}|\/(?![*/]))=?|[(),:;?[\]{}~]/y;
// `\<LT>` continuation rides through `\\[^]`; LS / PS are legal inside a string (ES2019), so
// only LF / CR end an unterminated one
const STRING_RE = /(?<quote>["'])(?:[^\n\r"'\\]|(?!\k<quote>)["']|\\(?:\r\n|[\S\s]))*\k<quote>?/y;
// one template chunk: from the opening backtick or the `}` closing a hole, up to the next
// backtick (close) or `${` (hole) - or the end of the text when unterminated
const TEMPLATE_CHUNK_RE = /[`}](?:[^$\\`]|\\[\S\s]|\$(?!\{))*(?:`|\$\{)?/y;
// a regex literal candidate MUST close on its line - an unterminated candidate is a division
// operator after all (the conservative read: a mis-read regex leaves a `/` as code, a mis-read
// division would swallow the rest of the line as a literal)
const REGEX_RE = /\/(?![*/])(?:\[(?:[^\n\r\\\]\u{2028}\u{2029}]|\\[^\n\r\u{2028}\u{2029}])*\]|[^\n\r/[\\\u{2028}\u{2029}]|\\[^\n\r\u{2028}\u{2029}])+\/[\p{ID_Continue}$\u{200C}\u{200D}]*/uy;
const JSX_PUNCT_RE = /[.:<=>{}]|\/(?![*/])/y;
const JSX_IDENT_RE = /[\p{ID_Start}$_][\p{ID_Continue}$\-\u{200C}\u{200D}]*/uy;
const JSX_STRING_RE = /(?<quote>["'])(?:[^"']|(?!\k<quote>)["'])*\k<quote>?/y;
const JSX_TEXT_RE = /[^<>{}]+/y;
// a `<` that opens a TYPE PARAMETER list, not a JSX tag - the TSX spellings of a generic
// arrow (`<T,>`, `<T extends U>`, `<T = U>`, `<const T>`)
const TYPE_PARAMS_RE = /<\s*(?:const\s+)?[\p{ID_Start}$_][\p{ID_Continue}$]*\s*(?:,|extends\b|=(?!>))/uy;

function stickyMatch(re, src, pos) {
  re.lastIndex = pos;
  return re.exec(src);
}

function lineEnd(src, pos) {
  let p = pos;
  while (p < src.length && !isLineTerminator(src[p])) p++;
  return p;
}

// the tokenizer. `emit(type, start, end, info)` receives every token of `src` in order, typed:
//   'ws' / 'lt' / 'comment' (line, block, hashbang, HTML-like) - trivia
//   'ident' (IdentifierName, keywords included) / 'private' (`#name`) / 'number' / 'punct'
//   'string' / 'template' (ONE chunk - a hole's code lexes as code between chunks) / 'regex'
//   'jsx-text' / 'jsx-string' / 'jsx-ident' / 'jsx-punct' - inside an element, `jsx` dialect only
//   'invalid' - one code point nothing matched
// `dialect` defaults to the current file's. the scan never throws and never loops: every
// iteration consumes at least one code point. the state machine: `prev` (the previous
// significant token, see the register above), a mode stack, the brace kinds, the paren nesting
// and the two line-sensitive flags - one closure, three per-mode steps over it. `emit` gets a
// fourth argument for a `{`: `'block'` or `'object'`

export function scanTokens(src, emit, dialect = currentDialect) {
  const { jsx, script } = dialect;
  const { length } = src;
  let pos = 0;
  let prev = PREV_NONE;
  // the token before `prev` - what `async function` reads its position from
  let prevPrev = PREV_NONE;
  // mode stack, each frame { tag, nesting } - tag one of:
  //   'js' | 'head-paren' | 'fn-params' | 'template-hole' | 'jsx-tag' | 'jsx-tag-end' | 'jsx-children' | 'jsx-hole'
  const modes = [{ tag: 'js' }];
  // per open `{`: does its `}` end a value (an object literal, a function expression's or an
  // arrow's body) rather than a statement?
  const braces = [];
  let parenNesting = 0;
  // a `function` keyword whose parameter list has not opened yet: is it an EXPRESSION?
  let pendingFunction = null;
  // `class` keywords whose bodies have not opened yet, likewise: the body's `}` ends a value for a
  // class EXPRESSION and a statement for a declaration. the body is the next `{` at the keyword's
  // own paren / brace level - an `extends` clause's operand sits between, its groups tracked; a
  // STACK, because that operand can itself be a class (`class A extends class B {} {}`) whose own
  // body opens first
  const pendingClasses = [];
  // can a `++` / `--` / `!` here be postfix - did a value just end, on this line?
  let postfixAllowed = false;
  // nothing significant yet on this line - where an Annex B `-->` comment may stand
  let atLineStart = true;

  function significant(type, start, end, next, info) {
    prevPrev = prev;
    prev = next;
    atLineStart = false;
    pos = end;
    emit(type, start, end, info);
  }
  function trivia(type, start, end) {
    pos = end;
    emit(type, start, end);
  }
  function lineBreak() {
    postfixAllowed = false;
    if (NO_LINE_TERMINATOR_AFTER.has(prev)) prev = PREV_RESTRICTED_LINE_BREAK;
  }
  // a template chunk starting at `pos`: on the opening backtick (`opening`), or on the `}` that
  // closes a hole. a chunk ending in `${` opens a hole - a NEW hole mode for an opening chunk,
  // the existing one stays otherwise; any other chunk closes the template, leaving the hole
  // mode a non-opening chunk was lexed in
  function templateChunk(opening) {
    const [chunk] = stickyMatch(TEMPLATE_CHUNK_RE, src, pos);
    const end = pos + chunk.length;
    if (chunk.endsWith('${')) {
      if (opening) modes.push({ tag: 'template-hole', nesting: braces.length });
      postfixAllowed = false;
      significant('template', pos, end, PREV_TEMPLATE_HOLE);
    } else {
      if (!opening) modes.pop();
      postfixAllowed = true;
      significant('template', pos, end, PREV_VALUE);
    }
  }

  // one step in a code mode (js / head-paren / fn-params / template-hole / jsx-hole); false when
  // nothing matched
  function stepCode(mode, ch) {
    let m;
    if (ch === '/' && precedesExpression(prev) && (m = stickyMatch(REGEX_RE, src, pos))) {
      postfixAllowed = true;
      significant('regex', pos, pos + m[0].length, PREV_VALUE);
      return true;
    }
    if (script && ch === '<' && (m = stickyMatch(HTML_OPEN_COMMENT_RE, src, pos))) {
      trivia('comment', pos, pos + m[0].length);
      return true;
    }
    if (script && ch === '-' && atLineStart && (m = stickyMatch(HTML_CLOSE_COMMENT_RE, src, pos))) {
      trivia('comment', pos, pos + m[0].length);
      return true;
    }
    if (jsx && ch === '<' && precedesExpression(prev)
      && (src[pos + 1] === '>' || IDENT_START_RE.test(codePointStartingAt(src, pos + 1)))
      && !stickyMatch(TYPE_PARAMS_RE, src, pos)) {
      modes.push({ tag: 'jsx-tag' });
      significant('jsx-punct', pos, pos + 1, '<');
      return true;
    }
    // the `}` closing a template hole / JSX hole is that construct's token, not a brace
    if (ch === '}' && mode.tag === 'template-hole' && braces.length === mode.nesting) {
      templateChunk(false);
      return true;
    }
    if (ch === '}' && mode.tag === 'jsx-hole' && braces.length === mode.nesting) {
      modes.pop();
      significant('jsx-punct', pos, pos + 1, '}');
      return true;
    }
    if (m = stickyMatch(PUNCT_RE, src, pos)) {
      const [punct] = m;
      // a `{` carries whether it opens a block (statements inside) or an object literal - what
      // a consumer reading member positions asks of it
      const info = punct === '{' ? (opensBlock(prev) ? 'block' : 'object') : undefined;
      significant('punct', pos, pos + punct.length, punctuatorPrev(mode, punct), info);
      return true;
    }
    if (m = stickyMatch(IDENT_RE, src, pos)) {
      identifierToken(m[0]);
      return true;
    }
    if (m = stickyMatch(STRING_RE, src, pos)) {
      postfixAllowed = true;
      significant('string', pos, pos + m[0].length, PREV_VALUE);
      return true;
    }
    if (m = stickyMatch(NUMBER_RE, src, pos)) {
      postfixAllowed = true;
      significant('number', pos, pos + m[0].length, PREV_VALUE);
      return true;
    }
    if (ch === '`') {
      templateChunk(true);
      return true;
    }
    return false;
  }

  // one identifier token: a name after `.` / `?.` is a property - a value, never a keyword.
  // `function` / `class` remember whether they stand in expression position (an `async` ahead of
  // `function` is transparent); `async` stays legible so that read can look past it
  function identifierToken(word) {
    const isProperty = prev === '.' || prev === '?.' || word[0] === '#';
    const isValue = isProperty
      || !(EXPRESSION_KEYWORDS.has(word) || HEAD_PAREN_KEYWORDS.has(word) || BLOCK_KEYWORDS.has(word));
    postfixAllowed = isValue;
    if (!isProperty && word === 'function') {
      pendingFunction = { expression: functionIsExpressionAfter(prev === 'async' ? prevPrev : prev), nesting: parenNesting };
    }
    if (!isProperty && word === 'class') {
      pendingClasses.push({ expression: functionIsExpressionAfter(prev), nesting: parenNesting, braceDepth: braces.length });
    }
    const keepText = !isProperty && (word === 'async' || word === 'function');
    significant(word[0] === '#' ? 'private' : 'ident', pos, pos + word.length, isValue && !keepText ? PREV_VALUE : word);
  }

  // the register value a punctuator leaves, with its effect on the mode stack / brace kinds
  function punctuatorPrev(mode, punct) {
    switch (punct) {
      case '(':
        if (HEAD_PAREN_KEYWORDS.has(prev)) modes.push({ tag: 'head-paren', nesting: parenNesting });
        else if (pendingFunction && pendingFunction.nesting === parenNesting) {
          // the parameter list of the pending `function` (its name and `*` sit between)
          modes.push({ tag: 'fn-params', nesting: parenNesting, expression: pendingFunction.expression });
          pendingFunction = null;
        }
        parenNesting++;
        postfixAllowed = false;
        return punct;
      case ')':
        parenNesting--;
        postfixAllowed = true;
        if ((mode.tag !== 'head-paren' && mode.tag !== 'fn-params') || parenNesting !== mode.nesting) return punct;
        modes.pop();
        postfixAllowed = false;
        if (mode.tag === 'head-paren') return PREV_HEAD_PAREN_END;
        return mode.expression ? PREV_FN_EXPR_PARAMS_END : PREV_FN_DECL_PARAMS_END;
      case '{': {
        const pendingClass = pendingClasses.at(-1);
        if (pendingClass && pendingClass.nesting === parenNesting && pendingClass.braceDepth === braces.length) {
          // the innermost pending class's body: its `}` ends a value exactly when it is an expression
          braces.push(pendingClass.expression);
          pendingClasses.pop();
        } else braces.push(closesValue(prev));
        postfixAllowed = false;
        return punct;
      }
      case '}':
        // an object literal's `}` ends a value; a block's `}` (or an unmatched one in a fragment)
        // ends a statement
        postfixAllowed = braces.pop() === true;
        return postfixAllowed ? PREV_VALUE : '}';
      case ']':
        postfixAllowed = true;
        return punct;
      case '++': case '--':
        return postfixAllowed ? PREV_POSTFIX : PREV_UNARY_INC_DEC;
      case '!':
        // a `!` right after a value is the TS non-null postfix (`x! / 2` divides); a prefix `!`
        // never follows a value. `!=` / `!==` match as their own punctuators
        return postfixAllowed ? PREV_POSTFIX : punct;
      default:
        postfixAllowed = false;
        return punct;
    }
  }

  // one step inside a JSX tag (opening, or the closing `</...>`); false when nothing matched
  function stepJsxTag(mode) {
    let m;
    if (m = stickyMatch(JSX_PUNCT_RE, src, pos)) {
      const [punct] = m;
      significant('jsx-punct', pos, pos + punct.length, jsxPunctuatorPrev(mode, punct));
      return true;
    }
    if (m = stickyMatch(JSX_IDENT_RE, src, pos)) {
      significant('jsx-ident', pos, pos + m[0].length, PREV_VALUE);
      return true;
    }
    if (m = stickyMatch(JSX_STRING_RE, src, pos)) {
      significant('jsx-string', pos, pos + m[0].length, PREV_VALUE);
      return true;
    }
    return false;
  }

  function jsxPunctuatorPrev(mode, punct) {
    switch (punct) {
      case '<':
        modes.push({ tag: 'jsx-tag' });
        return punct;
      case '>':
        modes.pop();
        // `/>` and `</x>` end the element - a value; `>` of an opening tag enters its children
        if (prev !== '/' && mode.tag !== 'jsx-tag-end') {
          modes.push({ tag: 'jsx-children' });
          return punct;
        }
        postfixAllowed = true;
        return PREV_VALUE;
      case '{':
        modes.push({ tag: 'jsx-hole', nesting: braces.length });
        postfixAllowed = false;
        return PREV_JSX_HOLE;
      case '/':
        if (prev !== '<') return punct;
        // `</`: the closing tag of the element whose children we were in
        modes.pop();
        if (modes.at(-1).tag === 'jsx-children') modes.pop();
        modes.push({ tag: 'jsx-tag-end' });
        return punct;
      default:
        return punct;
    }
  }

  // one step among an element's children; false when nothing matched
  function stepJsxChildren(ch) {
    const m = stickyMatch(JSX_TEXT_RE, src, pos);
    if (m) {
      significant('jsx-text', pos, pos + m[0].length, PREV_VALUE);
      return true;
    }
    if (ch === '<') {
      modes.push({ tag: 'jsx-tag' });
      significant('jsx-punct', pos, pos + 1, '<');
      return true;
    }
    if (ch === '{') {
      modes.push({ tag: 'jsx-hole', nesting: braces.length });
      postfixAllowed = false;
      significant('jsx-punct', pos, pos + 1, PREV_JSX_HOLE);
      return true;
    }
    return false;
  }

  if (src.startsWith('#!')) trivia('comment', 0, lineEnd(src, 2));
  while (pos < length) {
    const mode = modes.at(-1);
    const ch = src[pos];
    let m;
    if (mode.tag === 'jsx-children' ? stepJsxChildren(ch)
      : mode.tag === 'jsx-tag' || mode.tag === 'jsx-tag-end' ? stepJsxTag(mode)
      : stepCode(mode, ch)) continue;
    // trivia, shared by every mode
    if (m = stickyMatch(WS_RE, src, pos)) {
      trivia('ws', pos, pos + m[0].length);
      continue;
    }
    if (m = stickyMatch(LINE_TERMINATOR_RE, src, pos)) {
      atLineStart = true;
      lineBreak();
      trivia('lt', pos, pos + m[0].length);
      continue;
    }
    if (ch === '/' && src[pos + 1] === '*') {
      const end = skipBlockComment(src, pos);
      if (LINE_TERMINATOR_TEST_RE.test(src.slice(pos, end))) lineBreak();
      trivia('comment', pos, end);
      continue;
    }
    if (m = stickyMatch(LINE_COMMENT_RE, src, pos)) {
      postfixAllowed = false;
      trivia('comment', pos, pos + m[0].length);
      continue;
    }
    // nothing matched: one code point, as an invalid token (a stray `#`, `@`, a lone
    // surrogate, a JSX attribute character with no rule) - the scan moves on
    const cp = codePointStartingAt(src, pos);
    significant('invalid', pos, pos + cp.length, cp);
  }
}

// the significant tokens of `src` as an array `{ type, start, end }`, trivia dropped - the
// shape a small fragment (an emitted splice) is read through when a consumer needs the
// neighbours of a token, not only the regions
export function significantTokens(src, dialect = currentDialect) {
  const tokens = [];
  scanTokens(src, (type, start, end) => {
    if (type !== 'ws' && type !== 'lt' && type !== 'comment') tokens.push({ type, start, end });
  }, dialect);
  return tokens;
}

// --- literal / comment region map ---

// every char of `src` classified into the regions a code-reading walk must step over: each
// region is a half-open `[start, end)` range carrying `kind`:
//   - 'string'      - `'...'` / `"..."` (with `\` escapes + `\<LineTerminator>` continuation)
//   - 'template'    - `` `...` `` text-content chunks (split around `${...}` holes, whose code
//     stays JS context where `//` IS a real line comment)
//   - 'regex'       - `/.../flags` in expression position
//   - 'comment'     - `/* ... */`, `// ...` up to (not including) its line terminator, the
//     hashbang, the Annex B HTML-like comments of a script
//   - 'jsx-text' / 'jsx-string' - an element's text and attribute strings (`jsx` dialect)
// a region carrying a closing char (a quote, a backtick, the regex closer / flags, the last
// char of JSX text) is a VALUE for the backward scan - it fuses with a following `(` - while a
// comment is transparent. single-entry memo keyed on the text + dialect: each transform
// processes one source, and the helpers on that source share the same string, so reads
// after the first hit the cache; a fragment lexed in between evicts it and it is re-lexed once
let cachedRegionsSrc = null;
let cachedRegionsDialect = null;
let cachedRegions = null;
export function literalRegionsOf(src) {
  if (src === cachedRegionsSrc && cachedRegionsDialect === currentDialect) return cachedRegions;
  const regions = [];
  scanTokens(src, (type, start, end) => {
    if (type === 'string' || type === 'template' || type === 'regex' || type === 'comment'
      || type === 'jsx-text' || type === 'jsx-string') regions.push({ start, end, kind: type });
  });
  cachedRegions = regions;
  cachedRegionsSrc = src;
  cachedRegionsDialect = currentDialect;
  return regions;
}

// binary search for the region containing `pos` (start <= pos < end). null when no region
// matches - pos is in JS context. exported so every lexer-aware walk over emitted text asks the
// SAME question of the SAME map instead of re-scanning the region list linearly
export function findRegionContaining(regions, pos) {
  let lo = 0;
  let hi = regions.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (regions[mid].start <= pos) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0) return null;
  const cand = regions[lo - 1];
  return pos >= cand.start && pos < cand.end ? cand : null;
}

// scan backwards past whitespace and comments; -1 if we walked off the start. queries the
// pre-computed literal-region map: positions inside a value region (string / template / regex /
// JSX text) return its closing char (significant - it fuses with `(`); positions inside a
// comment skip to before the opener and continue
export function prevSignificantPos(src, pos) {
  const regions = literalRegionsOf(src);
  let i = pos - 1;
  while (i >= 0) {
    const region = findRegionContaining(regions, i);
    if (region) {
      if (region.kind !== 'comment') return region.end - 1;
      i = region.start - 1;
      continue;
    }
    if (WS_OR_LT_RE.test(src[i])) {
      i--;
      continue;
    }
    return i;
  }
  return -1;
}
