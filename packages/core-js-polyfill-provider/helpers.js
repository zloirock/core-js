import { fileURLToPath } from 'node:url';

export function resolveImportPath(pkg, subpath, absoluteImports) {
  const source = `${ pkg }/${ subpath }`;
  if (!absoluteImports) return source;
  try {
    const resolved = import.meta.resolve(source);
    return resolved.startsWith('file:') ? fileURLToPath(resolved).replaceAll('\\', '/') : resolved;
  } catch {
    return source;
  }
}

export const POSSIBLE_GLOBAL_OBJECTS = new Set([
  'global',
  'globalThis',
  'self',
  'window',
]);

// convert Symbol.X key to kebab-case entry: Symbol.hasInstance -> symbol/has-instance
export function symbolKeyToEntry(key) {
  if (!key?.startsWith('Symbol.')) return null;
  const prop = key.slice(7);
  return `symbol/${ prop.replaceAll(/[A-Z]/g, c => `-${ c.toLowerCase() }`) }`;
}

// skip core-js internals and bundles - polyfilling their own code creates circular dependencies
const CORE_JS_INTERNAL_FILE = /[/\\](?:core-js|core-js-pure|@core-js[/\\]pure)[/\\](?:internals|modules)[/\\]/;
const CORE_JS_BUNDLE = /[/\\](?:core-js-bundle|@core-js[/\\]bundle)[/\\]/;

export function isCoreJSFile(filename) {
  return CORE_JS_INTERNAL_FILE.test(filename) || CORE_JS_BUNDLE.test(filename);
}

export function buildOffsetToLine(code) {
  const lineStarts = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === '\n') lineStarts.push(i + 1);
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

const DIRECTIVE = /^\s*core-js-disable-(?<kind>file|line|next-line)(?:\s+--|\s*$)/;

// merge two visitor objects - combine handlers for same node type
export function mergeVisitors(base, extra) {
  const merged = { ...base };
  for (const [key, handler] of Object.entries(extra)) {
    if (merged[key]) {
      const existing = merged[key];
      merged[key] = function (path) {
        existing.call(this, path);
        handler.call(this, path);
      };
    } else merged[key] = handler;
  }
  return merged;
}

export function parseDisableDirectives(comments, offsetToLine) {
  if (!comments) return null;
  const lines = new Set();
  for (const comment of comments) {
    const match = comment.value.match(DIRECTIVE);
    if (!match) continue;
    const { kind } = match.groups;
    if (kind === 'file') return true;
    const startLine = comment.loc ? comment.loc.start.line : offsetToLine(comment.start);
    const endLine = comment.loc ? comment.loc.end.line : startLine;
    if (kind === 'line') lines.add(startLine);
    else lines.add(endLine + 1); // next-line
  }
  return lines.size ? lines : null;
}
