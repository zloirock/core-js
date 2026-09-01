import { SINGLE_STATEMENT_SLOTS, isASTNode, statementListOf, walkAstChildren } from './ast-patterns.js';

// ES spec LineTerminator: U+000A, U+000D (skip the LF half of CRLF), U+2028, U+2029
function collectLineStarts(code) {
  const lineStarts = [0];
  for (let i = 0; i < code.length; i++) {
    const c = code.charCodeAt(i);
    if (c === 0x0A || c === 0x2028 || c === 0x2029
      || (c === 0x0D && code.charCodeAt(i + 1) !== 0x0A)) lineStarts.push(i + 1);
  }
  return lineStarts;
}

function lineIndexFor(lineStarts, offset) {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStarts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

// the line table is built on the FIRST query, not on construction: the directive scan asks for a
// line only when the file actually carries a core-js directive comment, which almost none do -
// eager construction spent a full source scan plus an O(lines) array per file, then threw it away
export function buildOffsetToLine(code) {
  let lineStarts = null;
  return offset => lineIndexFor(lineStarts ??= collectLineStarts(code), offset) + 1;
}

// ESTree/sourcemap `loc` positions: 1-based line, 0-BASED column (the two consumers of the
// diagnostics builder below want 1-based columns instead). eager and unguarded - the AST
// printer locates every node of every file, so the lazy build and the range check of the
// diagnostics twin would only add per-call cost
export function buildOffsetToLoc(code) {
  const lineStarts = collectLineStarts(code);
  return offset => {
    const lineIndex = lineIndexFor(lineStarts, offset);
    return { line: lineIndex + 1, column: offset - lineStarts[lineIndex] };
  };
}

// 1-based line + column; returns null when offset is not an in-range non-negative integer.
// shared lineStarts table lets column = offset - lineStarts[lineIndex] + 1 in O(log n).
// accepts offset === code.length so an EOF-anchored diagnostic still reports a valid position
export function buildOffsetToLineColumn(code) {
  const lineStarts = collectLineStarts(code);
  return offset => {
    if (!Number.isInteger(offset) || offset < 0 || offset > code.length) return null;
    const lineIndex = lineIndexFor(lineStarts, offset);
    return { line: lineIndex + 1, column: offset - lineStarts[lineIndex] + 1 };
  };
}

// `[\s*]*` (character class, not nested quantifiers) matches JSDoc continuation indent
// `\n * ` without backtracking. `m` flag picks up directives on continuation lines,
// not just the first (JSDoc: `/** ... \n * core-js-disable-file \n */`)
// eslint-disable-next-line redos/no-vulnerable -- `[\s*]*` is a character class, not nested quantifiers
const DIRECTIVE = /^[\s*]*core-js-disable-(?<kind>file|line|next-line)(?:\s|$)/m;

// merge two visitor objects - combine handlers for same node type
// supports function (shorthand for enter), { enter, exit }, and mixed formats.
// `$` is the estree-toolkit metadata key (e.g. `{ scope: true }`); it carries no enter/exit
// handlers and is merged shallowly so neither side's metadata is dropped
export function mergeVisitors(base, extra) {
  function toObject(v) {
    return typeof v === 'function' ? { enter: v } : v;
  }

  function chain(f, g) {
    return function (path, ...rest) {
      f.call(this, path, ...rest);
      g.call(this, path, ...rest);
    };
  }

  const merged = { ...base };
  for (const [key, handler] of Object.entries(extra)) {
    if (key === '$') {
      merged.$ = { ...merged.$, ...handler };
      continue;
    }
    // treat null/undefined on either side as "no handler" - `in merged` alone would pass
    // an explicit `base.X = null` into `toObject`, which later throws on `.enter`
    const current = merged[key];
    if (current === null || current === undefined) {
      merged[key] = handler;
    } else if (handler !== null && handler !== undefined) {
      const a = toObject(current);
      const b = toObject(handler);
      const combined = {};
      for (const phase of ['enter', 'exit']) {
        if (a[phase] && b[phase]) combined[phase] = chain(a[phase], b[phase]);
        else if (a[phase] || b[phase]) combined[phase] = a[phase] || b[phase];
      }
      // an all-empty combined handler (`{}` from two no-enter/exit sides) is inert on dispatch
      // (absent enter/exit = no-op); drop it for tidiness rather than keep a dead entry
      if (combined.enter || combined.exit) merged[key] = combined;
      else delete merged[key];
    }
  }
  return merged;
}

// the directive the anchors below emit - one spelling, so a re-parse of our own output reads it
// through the same scan as the author's
export const DISABLE_NEXT_LINE_DIRECTIVE = 'core-js-disable-next-line';

// the kind a comment's directive names - `file`, `line` or `next-line` - and null for a plain comment
export function disableDirectiveKind(value) {
  return DIRECTIVE.exec(value)?.groups.kind ?? null;
}

// a `-line` / `-next-line` directive pins its LINE association; consumers that reflow
// text (the AST printer's roundtrip gate) need to know which comments carry one
export function isLineBoundDisableDirective(value) {
  const kind = disableDirectiveKind(value);
  return kind !== null && kind !== 'file';
}

// the leading spelling: a comment that covers the line under it, which is what an anchor is
export function isNextLineDisableDirective(value) {
  return disableDirectiveKind(value) === 'next-line';
}

// `firstStmtStart`: `disable-file` fires only above all code (eslint-style scope).
// `ast`: enables multi-line expansion for `disable-next-line` so directives cover the
// whole following statement, not just its first line
export function parseDisableDirectives({ comments, offsetToLine, firstStmtStart, ast }) {
  if (!comments) return null;
  const lines = new Set();
  for (const comment of comments) {
    const match = comment.value.match(DIRECTIVE);
    if (!match) continue;
    const { kind } = match.groups;
    if (kind === 'file') {
      // `firstStmtStart` is conventionally undefined when the file has no statements;
      // accept null too (`a == null` covers both) so callers that prefer null-default
      // semantics don't silently fall through to a numeric comparison against 0
      if (firstStmtStart === undefined || firstStmtStart === null || comment.end <= firstStmtStart) return true;
      continue;
    }
    // synthetic comments (injected by sibling plugins) may lack `loc`/`start`/`end`
    let startLine, endLine;
    if (comment.loc) {
      startLine = comment.loc.start.line;
      endLine = comment.loc.end.line;
    } else if (offsetToLine && comment.start !== undefined && comment.end !== undefined) {
      startLine = offsetToLine(comment.start);
      endLine = offsetToLine(comment.end - 1);
    } else continue;
    if (kind === 'line') {
      lines.add(startLine);
      continue;
    }
    const nextLine = endLine + 1;
    lines.add(nextLine);
    const stmtEndLine = ast ? findStatementEndLine({ node: ast, targetLine: nextLine, offsetToLine }) : null;
    if (stmtEndLine > nextLine) {
      for (let i = nextLine + 1; i <= stmtEndLine; i++) lines.add(i);
    }
  }
  return lines.size ? lines : null;
}

// the only wrappers a directive scan descends PAST: they share a start line with their first
// child, and their end is the end of the file - falling back to it would disable the rest of the
// file instead of the targeted statement. `File` is babel's wrapper around Program.
// everything else that OPENS on the target line spans to its own end, brace hosts included
const PROGRAM_WRAPPER_TYPES = new Set(['Program', 'File']);

// text between JSX children and the quasis of a template: nodes by shape, never hosts of anything a
// directive could cover. a whitespace run between two JSX children opens on one line and ends on the
// next, so taking it for a host spans the directive over the child on the line below it
const TEXT_NODE_TYPES = new Set(['JSXText', 'TemplateElement']);

// the scan descends the SOURCE's own nesting, so a depth budget answers "the user nested deeply"
// exactly as it answers a broken tree: the previous cap of 64 truncated at ~16 levels of nested
// callbacks and the directive silently lost its multi-line span there, revoking the opt-out and
// injecting on a line the user disabled. an explicit worklist keeps the depth off the JS stack, so
// the walk needs no budget; `visited` covers the only unbounded case left, a cyclic foreign tree.
// the recursion this replaces only ever propagated the MAX end-line upward, so one flat accumulator
// over the whole frontier is the same answer
function findStatementEndLine({ node, targetLine, offsetToLine }) {
  const pending = isASTNode(node) ? [node] : [];
  // only nodes we DESCEND from need recording - the two `continue`s above are terminal, so a cycle
  // can only close through this set
  const descended = new Set();
  let best = null;
  while (pending.length) {
    const cur = pending.pop();
    if (TEXT_NODE_TYPES.has(cur.type)) continue;
    const lines = nodeLineSpan(cur, offsetToLine);
    if (!lines || lines.start > targetLine || lines.end < targetLine) continue;
    // a host OPENING on the target line spans the directive across its WHOLE body - decided BEFORE
    // descending: an inline first statement on the same line would otherwise return its own shorter
    // end-line and the directive would under-cover the block's trailing lines
    if (lines.start === targetLine && !PROGRAM_WRAPPER_TYPES.has(cur.type)) {
      // the FARTHEST matching end wins - siblings sharing the target line must not shorten it
      if (best === null || lines.end > best) best = lines.end;
      continue;
    }
    if (descended.has(cur)) continue;
    descended.add(cur);
    // element-wise, never a spread: a generated file's statement list can exceed the argument limit
    walkAstChildren(cur, child => pending.push(child));
  }
  return best;
}

// babel carries `node.loc.start/end.line`; oxc carries offsets only
function nodeLineSpan(node, offsetToLine) {
  if (node.loc) return { start: node.loc.start?.line, end: node.loc.end?.line };
  if (offsetToLine && typeof node.start === 'number' && typeof node.end === 'number') {
    return { start: offsetToLine(node.start), end: offsetToLine(node.end - 1) };
  }
  return null;
}

// the member lists both printers lay out one per line besides the statement lists
const OWN_LINE_MEMBER_LISTS = new Map([
  ['ClassBody', 'body'],
  ['ObjectExpression', 'properties'],
  ['ObjectPattern', 'properties'],
]);

// a line comment can open a line ahead of a node the printers lay out one per line - a statement
// (a list member or an unbraced body), a class member, an object or pattern property - and nowhere
// else: a template quasi and a JSX child are text, and the members of every other list (arguments,
// array elements, declarators, template substitutions) share a line, where a comment dropped
// between two of them covers whatever the printer puts after it. a node in any other position takes
// its anchor from the nearest ancestor in one that qualifies
function anchorsOwnLine(child, parent, key, listMember) {
  if (child.type.startsWith('JSX') || parent.type.startsWith('JSX') || TEXT_NODE_TYPES.has(child.type)) return false;
  // the keyed spelling of `isStatementPosition` - this walk holds the key, so no list scan
  if (!listMember) return SINGLE_STATEMENT_SLOTS.get(parent.type)?.includes(key) ?? false;
  return statementListOf(parent) === parent[key] || OWN_LINE_MEMBER_LISTS.get(parent.type) === key;
}

// the pass's own output has to carry every opt-out it honoured. coverage is decided by SOURCE LINES
// (`parseDisableDirectives`), and a reprint lays the nodes that shared a covered line one per line -
// two statements under a `-next-line`, two object or pattern properties, two class members, or the
// one-line block a trailing `-line` closed, which expands and leaves the directive under its `}` -
// so only the first of them stays under the directive and the NEXT pass over our output claims the
// rest. the anchor is the node: every OUTERMOST node opening on a covered line is led by its own
// `-next-line` directive, which covers it whole however the reprint lays it out (over a `-line` a
// superset, harmless on a second pass: everything else inside it was already transformed). the
// directive lands where a line comment may open a line (`anchorsOwnLine`), so a node anywhere else
// hands it to the nearest such ancestor. `isLed(node)` is the binding's own answer whether its print
// already puts such a directive directly above the node - babel reads the attached leading run, oxc
// the flat comment list - and `settled` holds the nodes another channel already anchored, pruned
// whole. a synthesized node without a position never anchors; its children are asked on their own.
// the walk is a worklist, not a recursion, for the same reason as the span scan above: the depth is
// the source's. returns the targets in tree order, each once
export function disableDirectiveAnchors({ ast, disabledLines, offsetToLine, isLed, settled = null }) {
  const anchors = [];
  if (!(disabledLines instanceof Set) || !isASTNode(ast)) return anchors;
  const claimed = new Set();
  const descended = new Set();
  // an entry carries the nearest anchorable ancestor-or-self, decided at the push, where the
  // child's own position is known
  const pending = [[ast, null]];
  while (pending.length) {
    const [node, host] = pending.pop();
    if (settled?.has(node)) continue;
    const line = nodeLineSpan(node, offsetToLine)?.start;
    if (typeof line === 'number' && disabledLines.has(line) && !PROGRAM_WRAPPER_TYPES.has(node.type)) {
      if (host !== null && !claimed.has(host)) {
        claimed.add(host);
        if (!isLed(host)) anchors.push(host);
      }
      continue;
    }
    if (descended.has(node)) continue;
    descended.add(node);
    const children = childEntries(node, host);
    // pushed in reverse so the stack pops them in source order
    for (let i = children.length - 1; i >= 0; i--) pending.push(children[i]);
  }
  return anchors;
}

// the worklist entries for a node's children, each with the anchorable ancestor-or-self it will
// hand an anchor to. babel hangs its comments on the nodes, and a directive comment opens on the
// very line it covers - never a child to look at
function childEntries(node, host) {
  const entries = [];
  walkAstChildren(node, (child, key, listMember) => {
    if (child.type.startsWith('Comment')) return;
    entries.push([child, anchorsOwnLine(child, node, key, listMember) ? child : host]);
  });
  return entries;
}
