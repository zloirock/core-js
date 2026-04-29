import { isASTNode } from './ast-patterns.js';

// ES spec LineTerminator: U+000A, U+000D (skip the LF half of CRLF), U+2028, U+2029
export function buildOffsetToLine(code) {
  const lineStarts = [0];
  for (let i = 0; i < code.length; i++) {
    const c = code.charCodeAt(i);
    if (c === 0x0A || c === 0x2028 || c === 0x2029
      || (c === 0x0D && code.charCodeAt(i + 1) !== 0x0A)) lineStarts.push(i + 1);
  }
  return offset => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

// `[\s*]*` (character class, not nested quantifiers) matches JSDoc continuation indent
// `\n * ` without backtracking. `m` flag picks up directives on continuation lines,
// not just the first (JSDoc: `/** ... \n * core-js-disable-file \n */`)
// eslint-disable-next-line sonarjs/slow-regex, redos/no-vulnerable -- `[\s*]*` is a character class, not nested quantifiers
const DIRECTIVE = /^[\s*]*core-js-disable-(?<kind>file|line|next-line)(?:\s|$)/m;

// merge two visitor objects - combine handlers for same node type
// supports function (shorthand for enter), { enter, exit }, and mixed formats.
// `$` is the estree-toolkit metadata key (e.g. `{ scope: true }`); it carries no enter/exit
// handlers and is merged shallowly so neither side's metadata is dropped
export function mergeVisitors(base, extra) {
  const toObject = v => typeof v === 'function' ? { enter: v } : v;
  const chain = (f, g) => function (path) {
    f.call(this, path);
    g.call(this, path);
  };
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
    } else if (handler === null || handler === undefined) {
      continue;
    } else {
      const a = toObject(current);
      const b = toObject(handler);
      const combined = {};
      for (const phase of ['enter', 'exit']) {
        if (a[phase] && b[phase]) combined[phase] = chain(a[phase], b[phase]);
        else if (a[phase] || b[phase]) combined[phase] = a[phase] || b[phase];
      }
      // both sides have no enter/exit (`{}` objects) - drop the key instead of leaving an
      // empty handler that would crash the visitor on dispatch
      if (combined.enter || combined.exit) merged[key] = combined;
      else delete merged[key];
    }
  }
  return merged;
}

// `firstStmtStart`: `disable-file` fires only above all code (eslint-style scope).
// `ast`: enables multi-line expansion for `disable-next-line` so directives cover the
// whole following statement, not just its first line
export function parseDisableDirectives(comments, offsetToLine, firstStmtStart, ast) {
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
    const stmtEndLine = ast ? findStatementEndLine(ast, nextLine, offsetToLine) : null;
    if (stmtEndLine > nextLine) {
      for (let i = nextLine + 1; i <= stmtEndLine; i++) lines.add(i);
    }
  }
  return lines.size ? lines : null;
}

// wrappers that share a start line with their first child when no code precedes -
// descend past these to reach the statement the directive actually targets
const STATEMENT_WRAPPERS = new Set([
  'BlockStatement',
  'File',
  'Program',
  'StaticBlock',
  'TSModuleBlock',
]);

// depth cap mirrors `resolve-node-type.MAX_DEPTH=64`. directive scan walks AST nodes
// only (filtered by isASTNode), but pathological deeply-nested input still risks stack
// overflow without a guard. silent truncation > crash here - directive can lose end-line
// span on deep trees but disable-next-line still works (line itself is added to `lines`)
const FIND_STATEMENT_MAX_DEPTH = 64;
function findStatementEndLine(node, targetLine, offsetToLine, depth = 0) {
  if (depth > FIND_STATEMENT_MAX_DEPTH || !isASTNode(node)) return null;
  const lines = nodeLineSpan(node, offsetToLine);
  if (!lines || lines.start > targetLine || lines.end < targetLine) return null;
  if (lines.start === targetLine && !STATEMENT_WRAPPERS.has(node.type)) return lines.end;
  // `isASTNode` filters foreign stamps (babel `extra`, sibling-plugin caches) so iterating
  // every own key stays safe even when plugins decorate the tree with non-AST values
  // eslint-disable-next-line no-restricted-syntax -- AST walker, keys are own-properties only
  for (const key in node) {
    const child = node[key];
    if (Array.isArray(child)) {
      for (const c of child) if (isASTNode(c)) {
        const found = findStatementEndLine(c, targetLine, offsetToLine, depth + 1);
        if (found) return found;
      }
    } else if (isASTNode(child)) {
      const found = findStatementEndLine(child, targetLine, offsetToLine, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// babel carries `node.loc.start/end.line`; oxc carries offsets only
function nodeLineSpan(node, offsetToLine) {
  if (node.loc) return { start: node.loc.start?.line, end: node.loc.end?.line };
  if (offsetToLine && typeof node.start === 'number' && typeof node.end === 'number') {
    return { start: offsetToLine(node.start), end: offsetToLine(node.end - 1) };
  }
  return null;
}
