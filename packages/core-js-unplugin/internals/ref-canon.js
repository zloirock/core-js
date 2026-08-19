// Final generated-name canonicalization for the text emitter: rename generated refs to
// their canonical PRINT-ORDER slots (the shared `assignCanonicalRefSlots` rule - the AST
// emitter's prune/renumber applies the same one).
// runs between queue composition and the magic-string writes: every edit lands inside
// replacement contents, which sourcemaps treat as opaque, so original positions never move.
// the pass is text-based by necessity (the final print order only exists after composition);
// all lexical work rides the one tokenizer of `text-scan` - a generated name is an identifier
// TOKEN, never a substring: what sits inside a string, a template chunk, a comment, a regex
// or JSX text is text, and a `#_ref` private name or a `<_ref>` tag is not our binding
import { assignCanonicalRefSlots, isGeneratedSlotShapedName } from '@core-js/polyfill-provider/injector-base';
import { groupedGuardTest } from './plugin-helpers.js';
import { isInlineWhitespace, isLineTerminator, scanTokens } from './text-scan.js';

const DECLARATION_KEYWORDS = new Set(['var', 'let', 'const']);
// modifiers that stand before a class / object member's KEY
const MEMBER_MODIFIERS = new Set([
  'abstract', 'accessor', 'async', 'declare', 'get', 'override', 'private', 'protected', 'public', 'readonly', 'set', 'static',
]);

// the lexed view of one content: its significant tokens (each with its text, the brace it sits
// in and its bracket depth inside that brace) and the variable declarations found among them, as
// `{ keyword, declarators }` where a declarator is `{ idIndex, start, end, hasInit }` (`idIndex`
// is -1 for a pattern id). the declaration model is the one the excision below rebuilds a list
// from, so it knows every shape a list has: all three keywords, an initializer, a pattern id, a
// `for` head ending at `of` / `in`. the brace KIND - block, object, class, interface, enum - is
// what tells a member key from a reference: the lexer says block / object, and a `class` /
// `interface` / `enum` keyword ahead of the `{` names the body kinds whose members are keys
function lexContent(content) {
  const tokens = [];
  scanTokens(content, (type, start, end, info) => {
    if (type !== 'ws' && type !== 'lt' && type !== 'comment') tokens.push({ type, start, end, info });
  });
  for (const token of tokens) token.text = content.slice(token.start, token.end);
  const frames = [{ kind: 'block', depth: 0 }];
  let pendingBody = null;
  for (const [i, token] of tokens.entries()) {
    const frame = frames.at(-1);
    token.enclosing = frame;
    token.depth = frame.depth;
    if (token.type !== 'punct') {
      if (token.type !== 'ident' || tokens[i - 1]?.text === '.' || tokens[i - 1]?.text === '?.') continue;
      // `class` is reserved; `interface` / `enum` are names in JS, so they count only when spelled
      // as a declaration head - `interface Name {` / `enum Name {` (type parameters / `extends` between)
      if (token.text === 'class') pendingBody = { kind: 'class', depth: frame.depth };
      else if ((token.text === 'interface' || token.text === 'enum') && tokens[i + 1]?.type === 'ident'
        && ['{', '<', 'extends'].includes(tokens[i + 2]?.text)) {
        pendingBody = { kind: token.text, depth: frame.depth };
      }
      continue;
    }
    switch (token.text) {
      case '(': case '[': frame.depth++; break;
      case ')': case ']': if (frame.depth > 0) frame.depth--; break;
      case '{': {
        const kind = pendingBody && pendingBody.depth === frame.depth ? pendingBody.kind : token.info ?? 'block';
        pendingBody = null;
        frames.push({ kind, depth: 0 });
        break;
      }
      case '}': if (frames.length > 1) frames.pop(); break;
      case ';': pendingBody = null; break;
    }
  }
  const declarations = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type !== 'ident' || !DECLARATION_KEYWORDS.has(token.text)) continue;
    const prev = tokens[i - 1];
    if (prev?.text === '.' || prev?.text === '?.') continue;
    const forHead = prev?.text === '(' && (tokens[i - 2]?.text === 'for'
      || (tokens[i - 2]?.text === 'await' && tokens[i - 3]?.text === 'for'));
    const declarators = [];
    let j = i + 1;
    for (;;) {
      const idToken = tokens[j];
      if (!idToken) break;
      const declarator = { idIndex: idToken.type === 'ident' ? j : -1, start: idToken.start, end: idToken.end, hasInit: false };
      j = declarator.idIndex === -1 ? skipBalanced(tokens, j, forHead) : j + 1;
      if (tokens[j]?.text === '=') {
        declarator.hasInit = true;
        j = skipBalanced(tokens, j + 1, forHead);
      }
      declarator.end = tokens[j - 1].end;
      declarators.push(declarator);
      if (tokens[j]?.text !== ',') break;
      j++;
    }
    // the statement's `;`, when the list ends in one - the whole-statement excision takes it
    declarations.push({ keyword: token, declarators, semicolonEnd: tokens[j]?.text === ';' ? tokens[j].end : undefined });
  }
  return { tokens, declarations };
}

// advance over one declarator operand (a pattern id, or an initializer) to the token that ends
// it at depth 0: the list separator `,`, the statement's `;`, and in a `for` head the `of` / `in`
// keyword. template chunks and JSX holes count as brackets too
function skipBalanced(tokens, from, forHead) {
  let depth = 0;
  let j = from;
  for (; j < tokens.length; j++) {
    const { type, text } = tokens[j];
    if (type === 'template') {
      if (text.startsWith('}')) depth--;
      if (text.endsWith('${')) depth++;
      continue;
    }
    if (text === '(' || text === '[' || text === '{') depth++;
    else if (text === ')' || text === ']' || text === '}') {
      if (depth === 0) break;
      depth--;
    } else if (depth === 0 && (text === ',' || text === ';' || (forHead && (text === 'of' || text === 'in')))) break;
  }
  return j;
}

// a spelling of a generated name that is NOT a reference to our binding: a member property
// (`x._ref2`, incl. `?.`), an object-literal key (`{ _ref2: v }` - `{` / `,` before AND `:`
// after; shorthand keeps its reference reading) or method (`{ _ref2() {} }`), a class /
// interface member key (`class K { _ref2 = 1; static _ref2() {} }` - at the body's member level,
// after `{` / `;` / `}` or a modifier), an enum member, a statement label (`_ref2: for (;;)` -
// `:` after, a statement boundary before) and its `break` / `continue` target. an emitted
// reference never stands in any of these - the text-side twin of the AST canon
// `isNonReferencePosition`, over the positions a user slice inside a splice can carry
function isNonReferenceToken(tokens, index) {
  const token = tokens[index];
  const prev = tokens[index - 1]?.text ?? '';
  const next = tokens[index + 1]?.text ?? '';
  if (prev === '.' || prev === '?.' || prev === 'break' || prev === 'continue') return true;
  if (next === ':'
    && (prev === '' || prev === '{' || prev === ',' || prev === ';' || prev === '}' || prev === ')' || prev === ':')) return true;
  const { kind } = token.enclosing;
  if (token.depth !== 0) return false;
  const afterMemberBoundary = prev === '{' || prev === ';' || prev === '}' || prev === '*' || MEMBER_MODIFIERS.has(prev);
  if (kind === 'class' || kind === 'interface') return afterMemberBoundary;
  if (kind === 'enum') return prev === '{' || prev === ',';
  if (kind === 'object') return next === '(' && (prev === '{' || prev === ',' || prev === '*' || MEMBER_MODIFIERS.has(prev));
  return false;
}

// the index of the `)` closing the `(` at token `index`; -1 when the group never closes
function matchingParen(tokens, index) {
  let depth = 0;
  for (let i = index; i < tokens.length; i++) {
    const { text } = tokens[i];
    if (text === '(') depth += 1;
    else if (text === ')' && --depth === 0) return i;
  }
  return -1;
}

// the index of the `(` left UNCLOSED before token `index` - the group the token is nested in
function unclosedParenBefore(tokens, index) {
  let depth = 0;
  for (let i = index - 1; i >= 0; i--) {
    const { text } = tokens[i];
    if (text === ')') depth += 1;
    else if (text === '(') {
      if (depth === 0) return i;
      depth -= 1;
    }
  }
  return -1;
}

// dead nested guard-memo strip: a guard memo nested DIRECTLY inside an outer guard's test slot
// whose ref nothing reads (`null == (_refY = null == (_refX = root) ? void 0 : ...)`) is
// write-only: the AST emitter allocates none there (the outer test already owns the one
// evaluation). the deadness only exists AFTER composition - the body that once read the ref was
// replaced by a receiver-independent claim - so the strip lives here. a TOP-LEVEL guard keeps its
// memo (the locked kept-swap canon). returns the dropped names; their declarators (a SCOPED ref
// carries one in a `var` list) are queued for excision through `dropDeclarator`
function stripDeadNestedGuardMemos({ occurrences, lexed, pushEdit, dropDeclarator }) {
  const droppedRefs = new Set();
  for (const [name, list] of occurrences) {
    // exactly ONE real (non-declarator) occurrence qualifies, and a declarator carrying an
    // initializer keeps its ref alive whatever the write looks like (the AST emitter's rule)
    const real = list.filter(occ => !occ.isDecl);
    if (real.length !== 1 || list.some(occ => occ.hasInit)) continue;
    const [{ item, index }] = real;
    const { tokens } = lexed.get(item.entry);
    const { content } = item.entry;
    function text(i) {
      return tokens[i]?.text;
    }
    if (text(index - 3) !== 'null' || text(index - 2) !== '==' || text(index - 1) !== '(' || text(index + 1) !== '=') continue;
    const open = unclosedParenBefore(tokens, index - 3);
    if (open < 2 || text(open - 2) !== 'null' || text(open - 1) !== '==') continue;
    const outer = tokens[open + 1];
    if (outer?.type !== 'ident' || !isGeneratedSlotShapedName(outer.text) || text(open + 2) !== '=') continue;
    // `_refX = ` goes, the memoized value stays in the test slot - and the group around it goes
    // too when the value is atomic (a name, a member chain, a call): the AST emitter reprints
    // the unwrapped operand bare, and `null == (_globalThis.window)` is the one spelling it never
    // prints. a value carrying a top-level operator keeps its parens (`null == (w = root)`)
    pushEdit(item.entry, tokens[index].start, tokens[index + 2].start, '');
    const close = matchingParen(tokens, index - 1);
    if (close !== -1) {
      const value = content.slice(tokens[index + 2].start, tokens[close].start);
      if (groupedGuardTest(value) === value) {
        pushEdit(item.entry, tokens[index - 1].start, tokens[index - 1].end, '');
        pushEdit(item.entry, tokens[close].start, tokens[close].end, '');
      }
    }
    for (const occ of list) if (occ.isDecl) dropDeclarator(occ);
    droppedRefs.add(name);
  }
  return droppedRefs;
}

// the edits that take the dropped declarators out of their declaration lists. a list that
// keeps at least one declarator loses each dropped RUN with the separator that joined it: a run
// followed by a survivor takes the comma-gap after it, a tail run takes the comma-gap before
// it; a list that keeps none loses the whole statement - keyword to `;`, with its own line when
// it stood on one (the indentation before it and one line break). spans are computed on the
// unedited content and never overlap, whatever the number of dropped neighbours in one list
function declarationExcisionEdits(content, declaration, dropped) {
  const { keyword, declarators, semicolonEnd } = declaration;
  const edits = [];
  if (dropped.size === declarators.length) {
    let { start } = keyword;
    let end = semicolonEnd ?? declarators.at(-1).end;
    let lineStart = start;
    while (lineStart > 0 && isInlineWhitespace(content[lineStart - 1])) lineStart--;
    if (lineStart === 0 || isLineTerminator(content[lineStart - 1])) {
      start = lineStart;
      if (isLineTerminator(content[end])) end += 1;
      else if (start > 0) start -= 1;
    }
    edits.push({ start, end, text: '' });
    return edits;
  }
  for (let i = 0; i < declarators.length;) {
    if (!dropped.has(declarators[i])) {
      i++;
      continue;
    }
    let j = i;
    while (j < declarators.length && dropped.has(declarators[j])) j++;
    if (j < declarators.length) edits.push({ start: declarators[i].start, end: declarators[j].start, text: '' });
    else edits.push({ start: declarators[i - 1].end, end: declarators[j - 1].end, text: '' });
    i = j;
  }
  return edits;
}

// the canonicalization entry point, invoked by the queue's apply() between composition and
// the magic-string writes. mutates splice / insert `content` fields in place and syncs the
// injector's declared-ref set so flush() declares the canonical survivors
export function canonicalizeRefNumbering({ splices, inserts, injector }) {
  const families = [...injector.generatedRefFamilies()].filter(([, names]) => names.size);
  if (!families.length) return;
  const generated = new Set();
  for (const [, names] of families) for (const name of names) generated.add(name);
  // position-ordered view of the final output: an insert at a position prints BEFORE an
  // overwrite starting there (appendRight attaches to the following chunk's intro)
  const items = [
    ...inserts.map(entry => ({ pos: entry.pos, tie: 0, entry })),
    ...splices.map(entry => ({ pos: entry.start, tie: 1, entry })),
  ].sort((a, b) => a.pos - b.pos || a.tie - b.tie);

  // occurrence sweep in print order (items ascend by position, each content's tokens run left
  // to right, so encounter order IS print order). non-referential spellings are dropped up
  // front. a DECLARATOR occurrence is recorded but never ranks: the scoped `var _refN;` spelling
  // precedes the first real use anyway, and the hoisted flush declaration does not exist yet
  const lexed = new Map();
  const occurrences = new Map();
  const printRank = [];
  const rankedSet = new Set();
  for (const item of items) {
    const { content } = item.entry;
    const view = lexContent(content);
    lexed.set(item.entry, view);
    const declaratorByIndex = new Map();
    for (const declaration of view.declarations) {
      for (const declarator of declaration.declarators) {
        if (declarator.idIndex !== -1) declaratorByIndex.set(declarator.idIndex, { declaration, declarator });
      }
    }
    view.tokens.forEach((token, index) => {
      if (token.type !== 'ident' || !generated.has(token.text) || isNonReferenceToken(view.tokens, index)) return;
      const decl = declaratorByIndex.get(index);
      const { text: name } = token;
      if (!decl && !rankedSet.has(name)) {
        rankedSet.add(name);
        printRank.push(name);
      }
      let list = occurrences.get(name);
      if (!list) occurrences.set(name, list = []);
      list.push({ item, index, start: token.start, end: token.end, isDecl: !!decl, hasInit: !!decl?.declarator.hasInit, decl });
    });
  }

  const editsByEntry = new Map();
  function pushEdit(entry, start, end, text) {
    let list = editsByEntry.get(entry);
    if (!list) editsByEntry.set(entry, list = []);
    list.push({ start, end, text });
  }
  // dropped declarators, grouped per declaration so each list is rebuilt once
  const droppedByDeclaration = new Map();
  function dropDeclarator(occ) {
    const { declaration, declarator } = occ.decl;
    let set = droppedByDeclaration.get(declaration);
    if (!set) droppedByDeclaration.set(declaration, set = new Set());
    set.add(declarator);
    set.entry = occ.item.entry;
  }

  const droppedRefs = stripDeadNestedGuardMemos({ occurrences, lexed, pushEdit, dropDeclarator });
  if (droppedRefs.size) {
    injector.dropRefs(droppedRefs);
    for (const name of droppedRefs) occurrences.delete(name);
  }
  for (const [declaration, dropped] of droppedByDeclaration) {
    for (const edit of declarationExcisionEdits(dropped.entry.content, declaration, dropped)) {
      pushEdit(dropped.entry, edit.start, edit.end, edit.text);
    }
  }

  // rank = the sweep's print order, assigned one family at a time; a name with
  // declarator-only occurrences appends at the end (defensive - allocate-and-use
  // discipline leaves none)
  const renameMap = new Map();
  for (const [prefix, names] of families) {
    const ordered = printRank.filter(name => names.has(name) && occurrences.has(name));
    for (const name of names) {
      if (occurrences.has(name) && !rankedSet.has(name)) ordered.push(name);
    }
    for (const [from, to] of assignCanonicalRefSlots(prefix, ordered, name => injector.isRefSlotForeign(name))) {
      renameMap.set(from, to);
    }
  }
  for (const [name, list] of occurrences) {
    const to = renameMap.get(name);
    if (!to) continue;
    for (const occ of list) pushEdit(occ.item.entry, occ.start, occ.end, to);
  }

  // ONE sink for every edit queued above - the strip, the excisions, the renames: applied per
  // content descending so recorded offsets stay valid, and applied whether or not any rename
  // happened (an early exit here once discarded a strip the injector had already been told of,
  // leaving a `_refN = ...` write whose declaration flush() no longer printed)
  for (const [entry, edits] of editsByEntry) {
    edits.sort((a, b) => b.start - a.start);
    let { content } = entry;
    for (const edit of edits) content = content.slice(0, edit.start) + edit.text + content.slice(edit.end);
    entry.content = content;
  }
  injector.canonicalizeRefs(renameMap);
}
