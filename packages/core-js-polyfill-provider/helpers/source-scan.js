import { isASTNode } from './ast-patterns.js';

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
    // `isASTNode` filters foreign stamps (babel `extra`, sibling-plugin caches) so iterating
    // every own key stays safe even when plugins decorate the tree with non-AST values
    // eslint-disable-next-line no-restricted-syntax -- AST walker, keys are own-properties only
    for (const key in cur) {
      const child = cur[key];
      if (Array.isArray(child)) {
        // element-wise, never a spread: a generated file's statement list can exceed the argument limit
        for (const c of child) if (isASTNode(c)) pending.push(c);
      } else if (isASTNode(child)) pending.push(child);
    }
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
