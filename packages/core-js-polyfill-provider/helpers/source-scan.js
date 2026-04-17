export function buildOffsetToLine(code) {
  const lineStarts = [0];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '\n' || (code[i] === '\r' && code[i + 1] !== '\n')) lineStarts.push(i + 1);
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

// allow leading `*` (with surrounding whitespace) so JSDoc-style block comments work
// (`comment.value` retains the `*` on continuation lines like ` * core-js-disable-file`).
// the character class `[\s*]*` keeps the regex linear - `\s*\*?\s*` would backtrack on long
// whitespace runs without a leading `*`. trailing `(?:\s|$)` accepts any whitespace (incl.
// newlines for multi-line block comments) or end-of-comment, with or without `--` reason
const DIRECTIVE = /^[\s*]*core-js-disable-(?<kind>file|line|next-line)(?:\s|$)/;

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
    if (!(key in merged)) {
      merged[key] = handler;
    } else {
      const a = toObject(merged[key]);
      const b = toObject(handler);
      merged[key] = {};
      for (const phase of ['enter', 'exit']) {
        if (a[phase] && b[phase]) merged[key][phase] = chain(a[phase], b[phase]);
        else if (a[phase] || b[phase]) merged[key][phase] = a[phase] || b[phase];
      }
    }
  }
  return merged;
}

// `firstStmtStart` (optional) is the offset of the first program statement; a `disable-file`
// directive only takes effect when it appears strictly before any code (eslint-style scope)
export function parseDisableDirectives(comments, offsetToLine, firstStmtStart) {
  if (!comments) return null;
  const lines = new Set();
  for (const comment of comments) {
    const match = comment.value.match(DIRECTIVE);
    if (!match) continue;
    const { kind } = match.groups;
    if (kind === 'file') {
      if (firstStmtStart === undefined || comment.end <= firstStmtStart) return true;
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
    if (kind === 'line') lines.add(startLine);
    else lines.add(endLine + 1); // next-line
  }
  return lines.size ? lines : null;
}
