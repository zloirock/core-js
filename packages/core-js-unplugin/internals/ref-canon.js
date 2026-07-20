// Final generated-name canonicalization for the text emitter: rename generated refs to
// their canonical PRINT-ORDER slots (the shared `assignCanonicalRefSlots` rule - the AST
// emitter's prune/renumber applies the same one).
// runs between queue composition and the magic-string writes: every edit lands inside
// replacement contents, which sourcemaps treat as opaque, so original positions never move.
// the pass is text-based by necessity (the final print order only exists after composition);
// all lexical work rides the canonical scanners - `literalRegionsOf` (strings, template
// text portions, comments, regex literals with `/` disambiguation) for span protection and
// the shared identifier char classes for Unicode-correct token boundaries
import { assignCanonicalRefSlots } from '@core-js/polyfill-provider/injector-base';
import { codePointEndingAt, IDENT_PART_RE, IDENT_START_RE, skipGap } from './text-scan.js';
import { literalRegionsOf, prevSignificantPos } from './plugin-helpers.js';

// identifier tokens OUTSIDE literal / comment regions, in print order. template `${ ... }`
// holes are not part of the template's text regions, so hole code scans naturally
function scanIdentifiers(content, onIdent) {
  const regions = literalRegionsOf(content);
  let cursor = 0;
  for (let r = 0; r <= regions.length; r++) {
    const stop = r < regions.length ? regions[r].start : content.length;
    let i = cursor;
    while (i < stop) {
      const ch = String.fromCodePoint(content.codePointAt(i));
      if (IDENT_START_RE.test(ch)) {
        let j = i + ch.length;
        while (j < stop) {
          const part = String.fromCodePoint(content.codePointAt(j));
          if (!IDENT_PART_RE.test(part) && !IDENT_START_RE.test(part)) break;
          j += part.length;
        }
        onIdent(content.slice(i, j), i, j);
        i = j;
        continue;
      }
      i += ch.length;
    }
    if (r < regions.length) cursor = regions[r].end;
  }
}

// declarator detection by bounded back-scan: `(ws* ident ws* ,)* ws* (var|let|const)` right
// before the occurrence marks it as a declaration-list member, not a reference
function isDeclaratorPosition(content, start) {
  let i = start;
  for (;;) {
    while (i > 0 && /\s/.test(content[i - 1])) i--;
    if (content.startsWith('var', i - 3) && !IDENT_PART_RE.test(content[i - 4] ?? '')) return true;
    if (content.startsWith('let', i - 3) && !IDENT_PART_RE.test(content[i - 4] ?? '')) return true;
    if (content.startsWith('const', i - 5) && !IDENT_PART_RE.test(content[i - 6] ?? '')) return true;
    if (content[i - 1] !== ',') return false;
    i--;
    while (i > 0 && /\s/.test(content[i - 1])) i--;
    let j = i;
    while (j > 0) {
      const ch = codePointEndingAt(content, j - 1);
      if (!IDENT_PART_RE.test(ch) && !IDENT_START_RE.test(ch)) break;
      j -= ch.length;
    }
    if (j === i) return false;
    i = j;
  }
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

  // occurrence sweep in print order (items ascend by position, each scan runs left to
  // right, so encounter order IS print order). non-referential spellings are dropped up
  // front: member props (`x._ref2`, incl. `?.`), object-literal keys (`{ _ref2: v }` -
  // `{`/`,` before AND `:` after; shorthand keeps its reference reading). a DECLARATOR
  // occurrence is recorded but never ranks: the scoped `var _refN;` spelling precedes the
  // first real use anyway, and the hoisted flush declaration does not exist yet
  const occurrences = new Map();
  const printRank = [];
  const rankedSet = new Set();
  for (const item of items) {
    const { content } = item.entry;
    scanIdentifiers(content, (name, start, end) => {
      if (!generated.has(name)) return;
      const beforeIdx = prevSignificantPos(content, start);
      const before = beforeIdx >= 0 ? content[beforeIdx] : '';
      if (before === '.') return;
      if ((before === '{' || before === ',') && content[skipGap(content, end)] === ':') return;
      const isDecl = isDeclaratorPosition(content, start);
      if (!isDecl && !rankedSet.has(name)) {
        rankedSet.add(name);
        printRank.push(name);
      }
      let list = occurrences.get(name);
      if (!list) occurrences.set(name, list = []);
      list.push({ item, start, end });
    });
  }

  const editsByEntry = new Map();
  function pushEdit(entry, start, end, text) {
    let list = editsByEntry.get(entry);
    if (!list) editsByEntry.set(entry, list = []);
    list.push({ start, end, text });
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
  if (!renameMap.size) return;
  for (const [name, list] of occurrences) {
    const to = renameMap.get(name);
    if (!to) continue;
    for (const occ of list) pushEdit(occ.item.entry, occ.start, occ.end, to);
  }

  // apply all edits per content descending so recorded offsets stay valid
  for (const [entry, edits] of editsByEntry) {
    edits.sort((a, b) => b.start - a.start);
    let { content } = entry;
    for (const edit of edits) content = content.slice(0, edit.start) + edit.text + content.slice(edit.end);
    entry.content = content;
  }
  injector.canonicalizeRefs(renameMap);
}
