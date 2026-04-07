import { fileURLToPath } from 'node:url';
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };

// strip g/y flags from RegExp to prevent lastIndex state between calls
export function toStatelessRegExp(re) {
  return re.global || re.sticky ? new RegExp(re.source, re.flags.replaceAll(/[gy]/g, '')) : re;
}

// compile an include/exclude pattern (raw regex source string or RegExp) to a stateless
// RegExp anchored to start/end. Convention matches @babel/helper-define-polyfill-provider:
// the string is treated as raw regex syntax (no escaping, no glob shorthand)
// module names only contain `[a-z0-9.-]` so the only practically-relevant meta char is `.`, which works
// because `.` matches any char (including the literal `.` separator)
// returns null on parse failure so callers can decide how to handle malformed patterns
export function patternToRegExp(pattern) {
  if (pattern instanceof RegExp) return toStatelessRegExp(pattern);
  try {
    return new RegExp(`^${ pattern }$`);
  } catch {
    return null;
  }
}

// generate a unique identifier name following Babel's hint-N convention.
// startSuffix === null means try the bare prefix first; otherwise start with `prefix${startSuffix}`
// on collision the suffix is incremented but clamped to minSuffix
// (pass minSuffix=2 to skip the unused `prefix1` slot, matching Babel's UID generator)
// isTaken is called for each candidate; return true when the name conflicts
export function findUniqueName(prefix, startSuffix, minSuffix, isTaken) {
  let counter = startSuffix;
  let name = counter === null ? prefix : `${ prefix }${ counter }`;
  while (isTaken(name)) {
    counter = Math.max((counter ?? 0) + 1, minSuffix);
    name = `${ prefix }${ counter }`;
  }
  return name;
}

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

// proxy globals sourced from the canonical built-in registry; `globalThis`/`self`/`window` etc.
export const POSSIBLE_GLOBAL_OBJECTS = new Set(knownBuiltInReturnTypes.globalProxies);

// build a static-method meta from a `class A extends B { static foo() { super.foo() } }` shape
// `classNode` is the ClassDeclaration / ClassExpression, `key` is the super property name,
// `isLocallyBound(name)` returns true when the parent identifier is shadowed by a local binding
// returns null when the shape is unsupported (non-identifier extends, shadowed parent, etc.)
export function buildSuperStaticMeta(classNode, key, isLocallyBound) {
  if (classNode?.type !== 'ClassDeclaration' && classNode?.type !== 'ClassExpression') return null;
  const { superClass } = classNode;
  if (superClass?.type !== 'Identifier') return null;
  const { name } = superClass;
  if (isLocallyBound(name)) return null;
  return { kind: 'property', object: name, key, placement: 'static' };
}

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
// the character class `[\s*]*` keeps the regex linear — `\s*\*?\s*` would backtrack on long
// whitespace runs without a leading `*`.
const DIRECTIVE = /^[\s*]*core-js-disable-(?<kind>file|line|next-line)(?:\s+--|\s*$)/;

// merge two visitor objects - combine handlers for same node type
// supports function (shorthand for enter), { enter, exit }, and mixed formats
export function mergeVisitors(base, extra) {
  const toObject = v => typeof v === 'function' ? { enter: v } : v;
  const chain = (f, g) => function (path) {
    f.call(this, path);
    g.call(this, path);
  };
  const merged = { ...base };
  for (const [key, handler] of Object.entries(extra)) {
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

export function parseDisableDirectives(comments, offsetToLine) {
  if (!comments) return null;
  const lines = new Set();
  for (const comment of comments) {
    const match = comment.value.match(DIRECTIVE);
    if (!match) continue;
    const { kind } = match.groups;
    if (kind === 'file') return true;
    const startLine = comment.loc ? comment.loc.start.line : offsetToLine(comment.start);
    const endLine = comment.loc ? comment.loc.end.line : offsetToLine(comment.end - 1);
    if (kind === 'line') lines.add(startLine);
    else lines.add(endLine + 1); // next-line
  }
  return lines.size ? lines : null;
}
