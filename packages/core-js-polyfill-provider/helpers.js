import { fileURLToPath } from 'node:url';
import entriesMap from '@core-js/compat/entries' with { type: 'json' };
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };

// strip g/y flags from RegExp to prevent lastIndex state between calls
export function toStatelessRegExp(re) {
  return re.global || re.sticky ? new RegExp(re.source, re.flags.replaceAll(/[gy]/g, '')) : re;
}

// walk every Identifier reachable from a binding pattern (`{a, b: [c]}`, `[d, ...e]`,
// `f = 1`, `{g = 2}`, etc.), invoking `visit(identifierNode)` per leaf. caller is
// responsible for short-circuit via captured flag since we always walk the whole tree
export function walkPatternIdentifiers(node, visit) {
  if (!node) return;
  switch (node.type) {
    case 'Identifier': visit(node); break;
    case 'ObjectPattern':
      for (const p of node.properties) {
        walkPatternIdentifiers(p.type === 'RestElement' ? p.argument : p.value, visit);
      }
      break;
    case 'ArrayPattern':
      for (const el of node.elements) walkPatternIdentifiers(el, visit);
      break;
    case 'AssignmentPattern': walkPatternIdentifiers(node.left, visit); break;
    case 'RestElement': walkPatternIdentifiers(node.argument, visit); break;
  }
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

// `array/at` -> `full/array/at` modules; top-level `actual`/`index`/... -> their root entry
export function lookupEntryModules(pattern) {
  if (typeof pattern !== 'string') return null;
  return entriesMap[`full/${ pattern }`] ?? entriesMap[pattern] ?? null;
}

// known namespace prefix or wildcard -> module-name pattern; everything else is an entry path
export function isModulePattern(pattern) {
  if (pattern instanceof RegExp) return true;
  if (typeof pattern !== 'string') return false;
  return pattern.startsWith('es.')
    || pattern.startsWith('esnext.')
    || pattern.startsWith('web.')
    || pattern.includes('*');
}

export function isEntryPattern(pattern) {
  return typeof pattern === 'string' && !isModulePattern(pattern);
}

// validate include/exclude option lists: must be arrays of strings or RegExps (or absent)
export function validatePatternList(name, list) {
  if (list === undefined || list === null) return;
  if (!Array.isArray(list)) {
    throw new TypeError(`.${ name } must be an array, or undefined (received ${ JSON.stringify(list) })`);
  }
  for (const item of list) {
    if (typeof item !== 'string' && !(item instanceof RegExp)) {
      throw new TypeError(`.${ name } elements must be strings or regular expressions (received ${ JSON.stringify(item) })`);
    }
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

// `globalThis` / `self` / `window` etc.
export const POSSIBLE_GLOBAL_OBJECTS = new Set(knownBuiltInReturnTypes.globalProxies);

// `globalThis.X` / `globalThis['X']` -> 'X', else null
export function globalProxyMemberName(node) {
  if (node?.type !== 'MemberExpression') return null;
  if (node.object?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(node.object.name)) return null;
  const { property, computed } = node;
  if (!computed && property?.type === 'Identifier') return property.name;
  if (computed && property?.type === 'StringLiteral') return property.value;
  // ESTree (oxc) uses `Literal` with a string value for string literals
  if (computed && property?.type === 'Literal' && typeof property.value === 'string') return property.value;
  return null;
}

// `super.X` in a static method -> static meta on the parent class. resolveSuperClassName
// chases `const Y = Array` aliases; returns null on real local bindings
export function buildSuperStaticMeta(classNode, key, resolveSuperClassName) {
  if (classNode?.type !== 'ClassDeclaration' && classNode?.type !== 'ClassExpression') return null;
  const { superClass } = classNode;
  if (!superClass) return null;
  if (superClass.type === 'Identifier') {
    const resolved = resolveSuperClassName(superClass.name);
    return resolved ? { kind: 'property', object: resolved, key, placement: 'static' } : null;
  }
  const globalMember = globalProxyMemberName(superClass);
  return globalMember ? { kind: 'property', object: globalMember, key, placement: 'static' } : null;
}

// shared `super.X` / `this.X` class-walking helpers. `t` is `@babel/types` or
// `estree-compat.types`; caches live on the closure — call once per file
export function createClassHelpers(t) {
  const isClassMember = node => t.isClassMethod(node) || t.isClassPrivateMethod(node)
    || t.isClassProperty(node) || t.isClassPrivateProperty(node) || t.isClassAccessorProperty(node);

  function classMemberKeyName(m) {
    const { key } = m;
    if (!key) return null;
    if (!m.computed && t.isIdentifier(key)) return key.name;
    if (t.isStringLiteral(key)) return key.value;
    if (t.isTemplateLiteral(key) && key.expressions.length === 0 && key.quasis.length === 1) {
      return key.quasis[0].value.cooked;
    }
    return null;
  }

  // arrows are transparent (lexical super/this); non-arrow fns short-circuit except for the
  // ESTree `MethodDefinition.value = FunctionExpression` wrapper. back-fills visited ancestors
  // so sibling walks in the same subtree are amortized O(1)
  const enclosingCache = new WeakMap();
  const backfill = (visited, value) => {
    for (const n of visited) enclosingCache.set(n, value);
    return value;
  };
  function findEnclosingClassMember(path) {
    const visited = [];
    for (let cur = path.parentPath; cur; cur = cur.parentPath) {
      const { node } = cur;
      if (enclosingCache.has(node)) return backfill(visited, enclosingCache.get(node));
      visited.push(node);
      if (isClassMember(node) || t.isStaticBlock(node)) return backfill(visited, {
        classBodyNode: cur.parentPath?.node,
        classNode: cur.parentPath?.parentPath?.node,
        isStatic: !!node.static || t.isStaticBlock(node),
      });
      if (t.isFunction(node) && !t.isArrowFunctionExpression(node)) {
        if (t.isClassMethod(cur.parentPath?.node)) continue; // ESTree wrapper
        return backfill(visited, null);
      }
    }
    return backfill(visited, null);
  }

  // follow a chain of `const X = Y` aliases up to the first unshadowed global name,
  // or null when the root is a real local binding (not an alias)
  function resolveSuperClassName(startName, scope) {
    let name = startName;
    const seen = new Set();
    while (!seen.has(name)) {
      seen.add(name);
      const binding = scope?.getBinding?.(name);
      if (!binding) return name;
      if (binding.constantViolations?.length) return null;
      const decl = binding.path?.node;
      if (decl?.type !== 'VariableDeclarator' || decl.init?.type !== 'Identifier') return null;
      name = decl.init.name;
    }
    return null;
  }

  function resolveSuperMember(path) {
    if (path.node.computed) return null;
    const key = path.node.property?.name;
    if (!key) return null;
    const info = findEnclosingClassMember(path);
    if (!info?.isStatic) return null;
    return buildSuperStaticMeta(info.classNode, key, name => resolveSuperClassName(name, path.scope));
  }

  const ownInstanceNames = new WeakMap();
  function getOwnInstanceNames(classBodyNode) {
    let names = ownInstanceNames.get(classBodyNode);
    if (names) return names;
    names = new Set();
    for (const m of classBodyNode.body) {
      if (isClassMember(m) && !m.static) {
        const name = classMemberKeyName(m);
        if (name) names.add(name);
      }
    }
    ownInstanceNames.set(classBodyNode, names);
    return names;
  }

  // static ctx -> always shadowed: `this` is the constructor, instance polyfills don't apply.
  // nested non-arrow fn -> `this` rebinds, can't prove ownership -> not shadowed
  function isShadowedByClassOwnMember(path, key) {
    if (typeof key !== 'string') return false;
    const info = findEnclosingClassMember(path);
    if (!info) return false;
    if (info.isStatic) return true;
    return t.isClassBody(info.classBodyNode) && getOwnInstanceNames(info.classBodyNode).has(key);
  }

  return { resolveSuperMember, isShadowedByClassOwnMember };
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
// the character class `[\s*]*` keeps the regex linear - `\s*\*?\s*` would backtrack on long
// whitespace runs without a leading `*`.
const DIRECTIVE = /^[\s*]*core-js-disable-(?<kind>file|line|next-line)(?:\s+--|\s*$)/;

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
    const startLine = comment.loc ? comment.loc.start.line : offsetToLine(comment.start);
    const endLine = comment.loc ? comment.loc.end.line : offsetToLine(comment.end - 1);
    if (kind === 'line') lines.add(startLine);
    else lines.add(endLine + 1); // next-line
  }
  return lines.size ? lines : null;
}
