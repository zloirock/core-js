// shared usage detection helpers for babel-plugin and unplugin
// all functions accept raw AST nodes + scope + adapter to abstract Babel vs ESTree differences
//
// scope adapter interface:
//   hasBinding(scope, name)         -> boolean
//   getBinding(scope, name)         -> { node, constantViolations } | null
//   getBindingNodeType(scope, name) -> string | null
//   isStringLiteral(node)           -> boolean
//   getStringValue(node)            -> string | null
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import {
  POSSIBLE_GLOBAL_OBJECTS,
  TS_EXPR_WRAPPERS,
  declaresRequireBinding,
  globalProxyMemberName,
  kebabToCamel,
  mayHaveSideEffects,
  stripQueryHash,
  symbolKeyToEntry,
} from './helpers.js';

// known-built-in-return-types enumerates every built-in identifier core-js knows about.
// constructors (Array, Map, ...) and global functions (parseInt, fetch, ...) are functions;
// namespaces (Math, JSON, Reflect, ...) and proxy globals (globalThis, self, ...) are plain objects
const KNOWN_FUNCTION_GLOBALS = new Set([
  ...Object.keys(knownBuiltInReturnTypes.constructors),
  ...Object.keys(knownBuiltInReturnTypes.globalMethods),
]);
const KNOWN_NAMESPACE_GLOBALS = new Set(knownBuiltInReturnTypes.namespaces);

// any name that could be polyfilled by core-js (constructors, static methods, namespaces,
// and proxy globals). used for pattern diagnostics that should fire only for known globals
export function isKnownGlobalName(name) {
  return KNOWN_FUNCTION_GLOBALS.has(name) || KNOWN_NAMESPACE_GLOBALS.has(name) || POSSIBLE_GLOBAL_OBJECTS.has(name);
}

// logical-assignment operators: `||=`, `&&=`, `??=` read the LHS then conditionally write
const LOGICAL_ASSIGN_OPERATORS = new Set(['||=', '&&=', '??=']);

// capitalised-identifier probe for polyfillHint values like `Symbol`/`Map`/`Promise`
const CAPITALISED_IDENT = /^[A-Z]\w*$/;
// `import _Foo from 'core-js/pure/symbol/iterator'` - extract Symbol key from polyfill path.
// `.[cm]?js` suffix is tolerated (explicit-extension import styles under TS-aware bundlers)
const SYMBOL_IMPORT_SOURCE = /(?:^|\/)symbol\/(?<name>[\w-]+)(?:\.[cm]?js)?$/;

// LHS of `Map ||= ...` reads the global before polyfill loads (ReferenceError); the
// import binding is read-only anyway, so substitution also throws at write time
export function checkLogicalAssignLhsGlobal(identifier, parent, isBound) {
  if (isBound || identifier?.type !== 'Identifier' || !isKnownGlobalName(identifier.name)) return null;
  if (parent?.type !== 'AssignmentExpression' || parent.left !== identifier) return null;
  if (!LOGICAL_ASSIGN_OPERATORS.has(parent.operator)) return null;
  return `\`${ identifier.name } ${ parent.operator } ...\` left-hand side cannot be polyfilled `
    + `(read-only import binding); expected runtime engine to provide \`${ identifier.name }\``;
}

// same ceiling as `resolve-node-type.MAX_DEPTH`; 10 is too low for cross-module alias chains
const MAX_KEY_DEPTH = 64;

// for `(0, X)` sequences: preceding elements would be silently dropped when plugins replace
// the receiver, so bail the collapse on any side-effect there
function unwrapParens(node) {
  while (node) {
    if (node.type === 'ParenthesizedExpression' || node.type === 'ChainExpression'
      || TS_EXPR_WRAPPERS.has(node.type)) node = node.expression;
    else if (node.type === 'SequenceExpression'
      && !node.expressions.slice(0, -1).some(mayHaveSideEffects)) {
      node = node.expressions.at(-1);
    } else break;
  }
  return node;
}

function isStaticPlacement(name) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(name)) return 'static';
  if (name[0] >= 'A' && name[0] <= 'Z') return 'static';
  return null;
}

function resolveBindingToGlobal(name, scope, adapter, seen) {
  if (!seen) seen = new Set();
  if (seen.has(name)) return null;
  seen.add(name);
  // plugin-managed pure-import mutation (`globalThis` → `_globalThis` / `Symbol` → `_Symbol`)
  // leaves a real import binding; adapter's `polyfillHint` carries the source global name so
  // downstream proxy-global / constructor recognition survives the rewrite
  const hintBinding = adapter.getBinding(scope, name);
  if (hintBinding?.polyfillHint
    && (CAPITALISED_IDENT.test(hintBinding.polyfillHint) || POSSIBLE_GLOBAL_OBJECTS.has(hintBinding.polyfillHint))) {
    return hintBinding.polyfillHint;
  }
  const bindingType = adapter.getBindingNodeType(scope, name);
  if (bindingType === 'ImportSpecifier' || bindingType === 'ImportDefaultSpecifier'
    || bindingType === 'ImportNamespaceSpecifier') return null;
  if (bindingType === 'VariableDeclarator') {
    const binding = adapter.getBinding(scope, name);
    const { init } = binding.node;
    if (binding.constantViolations?.length) return null;
    const pattern = binding.node.id;
    // `{ from, ...rest } = Array` - rest !=== init
    const props = pattern?.properties ?? pattern?.elements;
    if (props?.some(p => p?.type === 'RestElement' && p.argument?.name === name)) return null;
    // destructures bind `name` to a property of init, not init itself. proxy-global shorthand
    // (`{ Symbol } = globalThis`) is the only exception - aliases to the property key
    if (pattern?.type === 'ObjectPattern' && init) {
      const alias = resolveProxyGlobalDestructureAlias(pattern, init, name, scope, adapter, seen);
      if (alias) return alias;
    }
    if (pattern && pattern.type !== 'Identifier') return null;
    if (init?.type === 'Identifier') {
      // unbound -> global; self-reference (`var Map = Map`) -> global; bound -> follow chain
      // (which hits the top-level polyfillHint translation for plugin-managed imports)
      if (!adapter.hasBinding(scope, init.name) || init.name === name) return init.name;
      return resolveBindingToGlobal(init.name, scope, adapter, seen);
    }
    if (init) {
      const unwrapped = unwrapParens(init);
      if (unwrapped.type === 'Identifier') {
        if (!adapter.hasBinding(scope, unwrapped.name)) return unwrapped.name;
        return resolveBindingToGlobal(unwrapped.name, scope, adapter, seen);
      }
      if (unwrapped.type === 'MemberExpression' || unwrapped.type === 'OptionalMemberExpression') {
        return resolveObjectName(unwrapped, scope, adapter, seen);
      }
    }
  }
  // param, catch, class name - never a global
  return null;
}

// `const { X } = globalThis` (or `self` / `window` / ...) -> X resolves to globalThis.X.
// returns the property key or null when init isn't a proxy-global or `name` isn't matched.
// nested patterns (`const { A: { B } }`) are not followed - conservative single-level alias only
function resolveProxyGlobalDestructureAlias(pattern, init, name, scope, adapter, seen) {
  const receiver = resolveObjectName(init, scope, adapter, seen);
  if (!receiver || !POSSIBLE_GLOBAL_OBJECTS.has(receiver)) return null;
  for (const p of pattern.properties) {
    if (p.type !== 'Property' && p.type !== 'ObjectProperty') continue;
    if (patternBindingName(p.value) !== name) continue;
    return resolveKey(p.key, p.computed, scope, adapter);
  }
  return null;
}

// top-level binding name of a destructuring element, skipping `=default` wrappers. nested
// patterns (`[a, b]`, `{x, y}`) don't produce a single name and return null
function patternBindingName(node) {
  while (node?.type === 'AssignmentPattern') node = node.left;
  return node?.type === 'Identifier' ? node.name : null;
}

// `seen` threaded from resolveBindingToGlobal so cyclic const chains
// (`const a = b.x; const b = a.x;`) don't restart the cycle guard and stack-overflow
function resolveObjectName(objectNode, scope, adapter, seen) {
  objectNode = unwrapParens(objectNode);
  if (objectNode.type === 'Identifier') {
    if (adapter.hasBinding(scope, objectNode.name)) return resolveBindingToGlobal(objectNode.name, scope, adapter, seen);
    // no binding - global only if starts with uppercase or is a known global proxy
    return isStaticPlacement(objectNode.name) ? objectNode.name : null;
  }
  if (objectNode.type !== 'MemberExpression' && objectNode.type !== 'OptionalMemberExpression') return null;
  // globalThis[`Array`] - computed string-resolvable proxy access
  if (objectNode.computed) {
    return resolveComputedProxyName(objectNode, scope, adapter, seen);
  }
  // globalThis.Array, self.Promise, globalThis.globalThis.Array - walk past chained proxy globals
  // handles mixed chains: globalThis['self'].Array, globalThis.self['self'].Promise
  if (objectNode.property.type !== 'Identifier') return null;
  let inner = unwrapParens(objectNode.object);
  while (inner.type === 'MemberExpression' || inner.type === 'OptionalMemberExpression') {
    const memberKey = inner.computed ? resolveKey(inner.property, true, scope, adapter) : inner.property?.name;
    if (!memberKey || !POSSIBLE_GLOBAL_OBJECTS.has(memberKey)) return null;
    inner = unwrapParens(inner.object);
  }
  if (inner.type !== 'Identifier') return null;
  if (!isProxyGlobalIdentifier(inner, scope, adapter, seen)) return null;
  return objectNode.property.name;
}

// globalThis['Array'] / globalThis['self']['Array'] -> 'Array'
function resolveComputedProxyName(node, scope, adapter, seen) {
  const key = resolveKey(node.property, true, scope, adapter);
  if (!key) return null;
  // walk through chained proxy globals to the root identifier
  let obj = unwrapParens(node.object);
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') {
    const memberKey = obj.computed ? resolveKey(obj.property, true, scope, adapter) : obj.property?.name;
    if (!memberKey || !POSSIBLE_GLOBAL_OBJECTS.has(memberKey)) return null;
    obj = unwrapParens(obj.object);
  }
  if (obj.type !== 'Identifier') return null;
  if (!isProxyGlobalIdentifier(obj, scope, adapter, seen)) return null;
  return key;
}

// check if an identifier refers to a proxy global: either directly (`globalThis`)
// or through a const alias (`const g = globalThis`).
// `seen` threaded so cyclic `const a = b.x; const b = a.x;` doesn't restart the guard
function isProxyGlobalIdentifier(node, scope, adapter, seen) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(node.name) && !adapter.hasBinding(scope, node.name)) return true;
  // follow const alias: `const g = globalThis` / `const g = self`
  const resolved = resolveBindingToGlobal(node.name, scope, adapter, seen);
  return resolved !== null && POSSIBLE_GLOBAL_OBJECTS.has(resolved);
}

export function resolveKey(node, computed, scope, adapter, seen, depth = 0) {
  if (depth > MAX_KEY_DEPTH) return null;
  // oxc-parser preserves ParenthesizedExpression / TS wrappers on computed keys and
  // binding inits; Babel strips them. unwrap up front so the identifier-alias and
  // Symbol-member branches below work uniformly across parsers
  if (computed) node = unwrapParens(node);
  if (!computed && node.type === 'Identifier') return node.name;
  if (adapter.isStringLiteral(node)) return adapter.getStringValue(node);
  // `at` -> 'at'; `${'iter'}${'ator'}` -> 'iterator' when every interpolation resolves to a literal
  if (node.type === 'TemplateLiteral') {
    if (node.expressions.length === 0 && node.quasis.length === 1) return node.quasis[0].value.cooked;
    let out = '';
    for (let i = 0; i < node.quasis.length; i++) {
      out += node.quasis[i].value.cooked;
      if (i < node.expressions.length) {
        // fork `seen` per interpolation - same-binding reuse (`${k}${k}`) must not
        // trip the cycle guard after the first interpolation mutates a shared Set.
        // mirrors the fork pattern in the BinaryExpression `+` branch below
        const part = resolveKey(node.expressions[i], true, scope, adapter, new Set(seen), depth + 1);
        if (part === null) return null;
        out += part;
      }
    }
    return out;
  }
  // computed: const variable - follow to init and resolve recursively
  if (node.type === 'Identifier' && computed) {
    // depth ceiling alone doesn't catch short cycles (`a = b; b = a`)
    if (seen?.has(node.name)) return null;
    const nextSeen = seen ?? new Set();
    nextSeen.add(node.name);
    const binding = adapter.getBinding(scope, node.name);
    if (binding && !binding.constantViolations?.length) {
      if (binding.node?.type === 'VariableDeclarator') {
        const { init } = binding.node;
        if (init) return resolveKey(init, true, scope, adapter, nextSeen, depth + 1);
      }
      // polyfill import binding (e.g., import _Symbol$iterator from '.../symbol/iterator')
      // - recognize as Symbol.<name> to compensate for in-place AST mutation in babel-plugin
      if (binding.importSource) {
        const match = SYMBOL_IMPORT_SOURCE.exec(binding.importSource);
        if (match) return `Symbol.${ kebabToCamel(match.groups.name) }`;
      }
    }
  }
  // string concatenation: 'a' + 'b'
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    // fork `seen` per branch so `a + a` (same binding both sides) doesn't mis-trigger the
    // cycle guard on the right branch after the left added `a` to the shared Set
    const left = resolveKey(node.left, true, scope, adapter, new Set(seen), depth + 1);
    const right = resolveKey(node.right, true, scope, adapter, new Set(seen), depth + 1);
    if (left !== null && right !== null) return left + right;
  }
  // Symbol.X computed access - Symbol.iterator, Symbol['iterator'], Symbol[key] where key = 'iterator'
  if (computed && (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
    && asSymbolRef(node.object, scope, adapter)) {
    const name = resolveKey(node.property, node.computed, scope, adapter, seen, depth + 1);
    if (name) return `Symbol.${ name }`;
  }
  return null;
}

// bare unbound `Symbol` / capitalised const-alias (`const Sym = Symbol`) /
// proxy-global access (`globalThis.Symbol`, `self.window.Symbol`). lowercase idents skip
// the const-chain walk - `Symbol` aliases are capitalised by convention
function resolvesToGlobalSymbol(node, scope, adapter) {
  if (node.type === 'Identifier') {
    if (node.name === 'Symbol') return !adapter.hasBinding(scope, 'Symbol');
    if (!CAPITALISED_IDENT.test(node.name)) return false;
    return resolveBindingToGlobal(node.name, scope, adapter) === 'Symbol';
  }
  return globalProxyMemberName(node, scope, adapter) === 'Symbol';
}

// preserve pre-unwrap node so callers can seed both forms into handledObjects;
// Set dedup absorbs the duplicate when raw === unwrapped
function asSymbolRef(node, scope, adapter) {
  const unwrapped = unwrapParens(node);
  return unwrapped && resolvesToGlobalSymbol(unwrapped, scope, adapter) ? { raw: node, unwrapped } : null;
}

// `var X = X` — hoisted var init references its own name, which at runtime reads the
// outer (global) scope before the local is assigned. Factory wraps a per-binding cache
// because the usage transform mutates `init.name` (X → _X) after the first visit, so a
// non-cached recheck on later references would miss the invariant.
// `getKind` varies by adapter: babel has `binding.kind`, estree-toolkit reads `kind` off
// the parent VariableDeclaration
export function createSelfRefVarGuard(getKind) {
  const cache = new WeakMap();
  return function isSelfRefVarBinding(binding) {
    const decl = binding?.path?.node ?? binding?.node;
    if (!decl || decl.type !== 'VariableDeclarator') return false;
    if (cache.has(decl)) return cache.get(decl);
    const { id, init } = decl;
    const result = getKind(binding) === 'var'
      && id?.type === 'Identifier'
      && init?.type === 'Identifier'
      && init.name === id.name;
    cache.set(decl, result);
    return result;
  };
}

function isImportBinding(name, scope, adapter) {
  if (!adapter.hasBinding(scope, name)) return false;
  const type = adapter.getBindingNodeType(scope, name);
  return type === 'ImportSpecifier' || type === 'ImportDefaultSpecifier' || type === 'ImportNamespaceSpecifier';
}

function buildMemberMeta(node, scope, adapter) {
  // computed keys may arrive wrapped in TS constructs (`obj[(k) as any]`, `obj[k!]`) -
  // resolveKey can't walk identifier-alias chain through a TS expression wrapper root
  const key = node.computed
    ? resolveKey(unwrapParens(node.property), true, scope, adapter)
    : node.property.name || node.property.value;
  if (!key || key === 'prototype') return null;
  const obj = unwrapParens(node.object);
  // direct `X.prototype.Y` -> instance-method on X. indirect alias (`const P = X.prototype`
  // / `const { prototype: P } = X`) is picked up by type engine's `resolvePrototypeAsInstance`
  // via `enhanceMeta`
  if ((obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression')
    && resolveKey(obj.property, obj.computed, scope, adapter) === 'prototype') {
    const protoName = resolveObjectName(obj.object, scope, adapter);
    if (protoName) return { kind: 'property', object: protoName, key, placement: 'prototype' };
  }
  const objectName = resolveObjectName(obj, scope, adapter);
  if (!objectName && obj.type === 'Identifier' && isImportBinding(obj.name, scope, adapter)) return null;
  const placement = objectName ? isStaticPlacement(objectName) : 'prototype';
  return { kind: 'property', object: objectName, key, placement };
}

export function handleMemberExpressionNode(node, scope, adapter, handledObjects, suppressProxyGlobals) {
  const symbolKey = resolveComputedSymbolKey(node, scope, adapter);
  if (symbolKey) {
    // mark both positions so neither the member-visitor (outer MemberExpression.object) nor
    // the identifier-visitor (unwrapped Identifier) re-enters this node. `asSymbolRef`
    // already walked the `unwrapParens` chain and confirmed the binding guard
    handledObjects.add(symbolKey.ref.raw);
    handledObjects.add(symbolKey.ref.unwrapped);
    return { kind: 'property', object: null, key: symbolKey.key, placement: 'prototype' };
  }
  const meta = buildMemberMeta(node, scope, adapter);
  if (meta) markHandledObjects(node, handledObjects, suppressProxyGlobals);
  return meta;
}

// Symbol.iterator -> is-iterable (replaces the whole BinaryExpression); others -> symbol/X (LHS only)
export function resolveSymbolInEntry(key) {
  if (key === 'Symbol.iterator') return { entry: 'is-iterable', hint: 'isIterable' };
  const entry = symbolKeyToEntry(key);
  if (!entry) return null;
  return { entry, hint: key.replace('.', '$') };
}

export function resolveSymbolIteratorEntry(node, parent) {
  const isCall = (parent?.type === 'CallExpression' || parent?.type === 'OptionalCallExpression')
    && parent.callee === node;
  return isCall && parent.arguments.length === 0 && !parent.optional ? 'get-iterator' : 'get-iterator-method';
}

// seeds `handledObjects` only for polyfillable Symbol.X - see comment inside
export function handleBinaryIn(node, scope, adapter, handledObjects) {
  if (node.operator !== 'in') return null;
  const left = unwrapParens(node.left);
  const ref = (left.type === 'MemberExpression' || left.type === 'OptionalMemberExpression')
    ? asSymbolRef(left.object, scope, adapter) : null;
  if (ref) {
    const name = resolveKey(left.property, left.computed, scope, adapter);
    if (name) {
      const key = `Symbol.${ name }`;
      // seed `handledObjects` only when the rewrite actually replaces the BinaryExpression -
      // unpolyfillable keys leave the `Symbol` identifier in place and it still needs its polyfill
      if (resolveSymbolInEntry(key)) {
        handledObjects.add(node.left);
        handledObjects.add(left);
        handledObjects.add(ref.raw);
        handledObjects.add(ref.unwrapped);
        // proxy-global LHS (`globalThis.Symbol.iterator in x`) - the outer `_isIterable(x)`
        // rewrite subsumes the entire chain, so the leaf `globalThis` identifier must not
        // trigger its own polyfill. without this, unplugin's transform-queue fails to compose
        // the inner `globalThis`-replacement into the outer's eliminated-needle content
        markSubsumedProxyChain(ref.unwrapped, handledObjects);
      }
      return { kind: 'in', key, object: null, placement: null };
    }
  }
  // identifier bound to Symbol.X - resolveKey may return Symbol.X for indirect bindings
  // (e.g., const k = Symbol.iterator; k in obj - works regardless of object type)
  const resolvedLeft = resolveKey(node.left, true, scope, adapter);
  if (resolvedLeft?.startsWith('Symbol.')) {
    return { kind: 'in', key: resolvedLeft, object: null, placement: null };
  }
  // 'key' in Object - string key in static/global object
  if (resolvedLeft) {
    const objectName = resolveObjectName(node.right, scope, adapter);
    if (objectName) {
      const placement = isStaticPlacement(objectName);
      if (placement) return { kind: 'in', key: resolvedLeft, object: objectName, placement };
    }
  }
  return null;
}

// returns { key: 'Symbol.xxx', ref: { raw, unwrapped } } so the caller can mark handledObjects
// without re-walking the unwrap chain
function resolveComputedSymbolKey(node, scope, adapter) {
  if (!node.computed) return null;
  const prop = unwrapParens(node.property);
  if (prop?.type !== 'MemberExpression' && prop?.type !== 'OptionalMemberExpression') return null;
  const ref = asSymbolRef(prop.object, scope, adapter);
  if (!ref) return null;
  const name = resolveKey(prop.property, prop.computed, scope, adapter);
  return name ? { key: `Symbol.${ name }`, ref } : null;
}

// walk the proxy-global chain at `node`, seeding every intermediate MemberExpression AND the
// leaf `globalThis`/`self`/`window` Identifier. used when an outer rewrite fully subsumes the
// chain (`handleBinaryIn`'s Symbol.X case) - without the leaf, the identifier visitor fires a
// parallel polyfill for `globalThis` that the text-transform queue can't compose into the
// outer's eliminated-needle replacement
function markSubsumedProxyChain(node, handledObjects) {
  let current = unwrapParens(node);
  while (current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression') {
    handledObjects.add(current);
    current = unwrapParens(current.object);
  }
  if (current.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(current.name)) {
    handledObjects.add(current);
  }
}

// mark handled objects after processing a MemberExpression meta
// suppresses duplicate Identifier visitor firing for the object part
function markHandledObjects(node, handledObjects, suppressProxyGlobals) {
  const obj = unwrapParens(node.object);
  if (obj.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(obj.name)) {
    handledObjects.add(obj);
    return;
  }
  if (!suppressProxyGlobals) return;
  // walk down the proxy chain (`globalThis.Object`, `globalThis.self.Promise`, ...) and mark
  // every intermediate MemberExpression so the inner visitor doesn't re-process it. stop at
  // the proxy global leaf itself - it may need its own polyfill when the outer is not polyfilled
  let current = obj;
  while ((current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')
    && findProxyGlobal(current)) {
    handledObjects.add(current);
    current = unwrapParens(current.object);
  }
}

// find the proxy global identifier (globalThis, self, etc.) at the root of a MemberExpression chain
export function findProxyGlobal(node) {
  let obj = unwrapParens(node);
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') obj = unwrapParens(obj.object);
  return obj.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(obj.name) ? obj : null;
}

// map a destructure source identifier to its runtime receiver type hint
// unknown identifiers return null so the resolver falls through to its default type-hint fold
function destructureReceiverHint(objectName) {
  if (!objectName) return null;
  if (KNOWN_FUNCTION_GLOBALS.has(objectName)) return 'function';
  if (KNOWN_NAMESPACE_GLOBALS.has(objectName) || POSSIBLE_GLOBAL_OBJECTS.has(objectName)) return 'object';
  return null;
}

// resolve the argument at `index` in a call's `arguments` list, expanding any `...[lit]`
// spread of an inline array literal. returns null if a non-literal spread precedes `index`,
// since we can't statically know the expanded length
export function resolveCallArgument(args, index) {
  let i = 0;
  for (const arg of args) {
    if (arg?.type === 'SpreadElement') {
      if (arg.argument?.type !== 'ArrayExpression') return null;
      for (const el of arg.argument.elements) {
        if (i === index) return el;
        i++;
      }
      continue;
    }
    if (i === index) return arg;
    i++;
  }
  return null;
}

// build meta for a destructuring property given its resolved init node + key.
// `receiverHint` lets resolveHint reject `const { includes } = Array` (instance method
// that doesn't exist on the constructor) while accepting `Array.from` and inherited
// Function/Object prototype methods like `name`/`toString`.
export function buildDestructuringInitMeta(initNode, key, scope, adapter) {
  if (!initNode) return { kind: 'property', object: null, key, placement: null };
  // oxc-parser preserves ParenthesizedExpression (Babel strips them)
  const unwrapped = unwrapParens(initNode);
  // `Array ?? X`, `X ?? Array`, `X && Array`: try both branches, prefer the one
  // that resolves to a known global (for `??`/`||` the fallback is usually on the right,
  // for `&&` it's always the right).
  // `fromFallback` disables the destructure replacement when the runtime value may come
  // from either branch - `&&` is always conditional (primary only when left truthy, else
  // falsy left), so always flag; `??`/`||` flag only when the fallback is the resolved side
  if (unwrapped.type === 'LogicalExpression') {
    const primary = unwrapped.operator === '&&' ? unwrapped.right : unwrapped.left;
    const meta = buildDestructuringInitMeta(primary, key, scope, adapter);
    if (meta.object) return unwrapped.operator === '&&' ? { ...meta, fromFallback: true } : meta;
    // for `&&` both primary and fallback are the same (right), no point retrying
    if (unwrapped.operator === '&&') return meta;
    const fallback = buildDestructuringInitMeta(unwrapped.right, key, scope, adapter);
    if (fallback.object) return { ...fallback, fromFallback: true };
    return fallback;
  }
  // `(0, Array)`: sequence evaluates to its last expression
  if (unwrapped.type === 'SequenceExpression') {
    return buildDestructuringInitMeta(unwrapped.expressions.at(-1), key, scope, adapter);
  }
  // `const { from } = Array` or `const { from } = globalThis.Array`
  if (unwrapped.type === 'Identifier' || unwrapped.type === 'MemberExpression'
    || unwrapped.type === 'OptionalMemberExpression') {
    const objectName = resolveObjectName(unwrapped, scope, adapter);
    const placement = objectName ? isStaticPlacement(objectName) : null;
    const receiverHint = placement === 'static' ? destructureReceiverHint(objectName) : null;
    return { kind: 'property', object: objectName, key, placement, receiverHint };
  }
  if (adapter.isStringLiteral(unwrapped)) {
    return { kind: 'property', object: 'string', key, placement: 'prototype' };
  }
  return { kind: 'property', object: null, key, placement: null };
}

export function canTransformDestructuring({ parentType, parentInit, grandParentType, patternProperties }) {
  if (parentType === 'VariableDeclarator') {
    if (!parentInit) return false; // for-of/for-in - no init
    if (grandParentType === 'ForInStatement' || grandParentType === 'ForOfStatement') return false;
    // for-init: multiple polyfillable properties would require memoising the receiver or
    // double-evaluating it; one polyfillable + rest is safe (rest preserves the pattern)
    if (grandParentType === 'ForStatement') {
      const nonRest = patternProperties?.filter(p => p.type !== 'RestElement').length ?? 0;
      if (nonRest > 1) return false;
    }
    return true;
  }
  return parentType === 'AssignmentExpression';
}

// allow-list of TS type-only nodes - unknown `TS*` defaults to runtime (false positive is
// louder than silent skip). runtime-carrying wrappers (TSAsExpression, ...) stay out
const TS_TYPE_ONLY_NODES = new Set([
  'TSTypeAnnotation',
  'TSTypeParameterDeclaration',
  'TSTypeParameterInstantiation',
  'TSTypeParameter',
  'TSStringKeyword',
  'TSNumberKeyword',
  'TSBooleanKeyword',
  'TSBigIntKeyword',
  'TSSymbolKeyword',
  'TSVoidKeyword',
  'TSUndefinedKeyword',
  'TSNullKeyword',
  'TSNeverKeyword',
  'TSAnyKeyword',
  'TSObjectKeyword',
  'TSUnknownKeyword',
  'TSIntrinsicKeyword',
  'TSThisType',
  'TSArrayType',
  'TSTupleType',
  'TSUnionType',
  'TSIntersectionType',
  'TSParenthesizedType',
  'TSOptionalType',
  'TSRestType',
  'TSConditionalType',
  'TSInferType',
  'TSTypeOperator',
  'TSIndexedAccessType',
  'TSMappedType',
  'TSNamedTupleMember',
  'TSLiteralType',
  'TSTemplateLiteralType',
  'TSTypeReference',
  'TSTypeQuery',
  'TSTypePredicate',
  'TSQualifiedName',
  'TSImportType',
  'TSFunctionType',
  'TSConstructorType',
  'TSTypeLiteral',
  'TSInterfaceDeclaration',
  'TSInterfaceBody',
  'TSTypeAliasDeclaration',
  'TSPropertySignature',
  'TSMethodSignature',
  'TSIndexSignature',
  'TSCallSignatureDeclaration',
  'TSConstructSignatureDeclaration',
  'TSDeclareFunction',
  'TSDeclareMethod',
]);

// Flow type-only nodes (stable naming, no forward-compat concern)
const FLOW_TYPE_ONLY_NODES = new Set([
  'TypeAnnotation',
  'InterfaceDeclaration',
  'InterfaceTypeAnnotation',
  'InterfaceExtends',
  'TypeAlias',
  'OpaqueType',
  'TypeParameter',
  'TypeParameterDeclaration',
  'TypeParameterInstantiation',
  'GenericTypeAnnotation',
  'StringTypeAnnotation',
  'NumberTypeAnnotation',
  'BooleanTypeAnnotation',
  'NullLiteralTypeAnnotation',
  'VoidTypeAnnotation',
  'EmptyTypeAnnotation',
  'AnyTypeAnnotation',
  'MixedTypeAnnotation',
  'ExistsTypeAnnotation',
  'SymbolTypeAnnotation',
  'BigIntTypeAnnotation',
  'UnionTypeAnnotation',
  'IntersectionTypeAnnotation',
  'NullableTypeAnnotation',
  'ArrayTypeAnnotation',
  'TupleTypeAnnotation',
  'ObjectTypeAnnotation',
  'ObjectTypeProperty',
  'ObjectTypeSpreadProperty',
  'ObjectTypeIndexer',
  'ObjectTypeCallProperty',
  'ObjectTypeInternalSlot',
  'FunctionTypeAnnotation',
  'FunctionTypeParam',
  'TypeofTypeAnnotation',
  'IndexedAccessType',
  'OptionalIndexedAccessType',
  'StringLiteralTypeAnnotation',
  'NumberLiteralTypeAnnotation',
  'BooleanLiteralTypeAnnotation',
  'QualifiedTypeIdentifier',
]);

// is `type` a TS/Flow type-only node? `Declare*` is a stable Flow prefix
export function isTypeAnnotationNodeType(type) {
  if (!type) return false;
  if (TS_TYPE_ONLY_NODES.has(type) || FLOW_TYPE_ONLY_NODES.has(type)) return true;
  return type.startsWith('Declare');
}

// param positions (`(x: Foo) => Bar`) - pattern nodes hosting a child `typeAnnotation`
const TYPE_ANNOTATION_PARAM_HOSTS = new Set([
  'Identifier',
  'RestElement',
  'AssignmentPattern',
  'ObjectPattern',
  'ArrayPattern',
]);

// should the walker descend into `node` when walking a type annotation?
function isTypeWalkable(node) {
  if (!node || typeof node !== 'object') return false;
  const { type } = node;
  if (!type) return false;
  if (isTypeAnnotationNodeType(type)) return true;
  if (type === 'TSInterfaceBody' || type === 'TSModuleBlock' || type === 'TSTypeParameter') return true;
  return TYPE_ANNOTATION_PARAM_HOSTS.has(type);
}

// AST child keys that may hold nested type annotations across TS + Flow dialects
const TYPE_CHILD_KEYS = [
  'typeAnnotation',
  'types',
  'elementType',
  'objectType',
  'indexType',
  'checkType',
  'extendsType',
  'trueType',
  'falseType',
  'constraint',
  'default',
  'typeArguments',
  'typeParameters',
  'returnType',
  'params',
  'value',
  'argument',
  'impltype',
  'supertype',
  'nameType',
  'typeParameter',
  'members',
  'body',
];

// walk a type annotation subtree, invoking `onGlobal(name)` for every bare type reference.
// `isTypeWalkable` keeps the walker out of runtime bodies; `seen` bounds cyclic inputs
export function walkTypeAnnotationGlobals(annotation, onGlobal) {
  if (!annotation) return;
  const seen = new WeakSet();
  const stack = [annotation];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);
    if (node.type === 'TSTypeReference' && node.typeName?.type === 'Identifier') {
      onGlobal(node.typeName.name);
    } else if (node.type === 'GenericTypeAnnotation' && node.id?.type === 'Identifier') {
      onGlobal(node.id.name);
    }
    for (const key of TYPE_CHILD_KEYS) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) if (isTypeWalkable(c)) stack.push(c);
      } else if (isTypeWalkable(child)) {
        stack.push(child);
      }
    }
  }
}

// the polyfill replacement consumes `?.`, so the receiver null-check is redundant
export function isPolyfillableOptional(node, scope, adapter, resolve) {
  const obj = node.object;
  if (obj?.type !== 'Identifier' || adapter.hasBinding(scope, obj.name)) return false;
  if (resolve({ kind: 'global', name: obj.name })) return true;
  const key = !node.computed && node.property?.type === 'Identifier' && node.property.name;
  const resolved = key && resolve({ kind: 'property', object: obj.name, key, placement: 'static' });
  return resolved?.kind === 'static' || resolved?.kind === 'global';
}

// pull the source argument out of a dynamic import call (`import('core-js/...')`).
// covers both shapes: ImportExpression (`{type: 'ImportExpression', source}`) and the CallExpression
// form some parsers emit (`{type: 'CallExpression', callee: {type: 'Import'}, arguments: [...]}`)
function importExpressionSource(node, adapter) {
  const inner = unwrapParens(node);
  if (!inner) return null;
  if (inner.type === 'ImportExpression') return adapter.getStringValue(inner.source);
  if (inner.type === 'CallExpression' && inner.callee?.type === 'Import') {
    return adapter.getStringValue(inner.arguments?.[0]);
  }
  return null;
}

// extract entry source from an AST node (ImportDeclaration / require() / await import())
// returns source string or null if not an entry pattern. when `scope` is provided, calls to a
// shadowed `require` (locally bound) are ignored
export function getEntrySource(node, adapter, scope) {
  // import 'core-js/...'
  if (node.type === 'ImportDeclaration' && node.specifiers?.length === 0) {
    return adapter.getStringValue(node.source);
  }
  if (node.type !== 'ExpressionStatement') return null;
  // unwrap outer parens/TS wrappers: `(await import(...))` / `(require(...))` — parsers
  // that preserve `ParenthesizedExpression` would otherwise miss these entry patterns
  const expr = unwrapParens(node.expression);
  // require('core-js/...')
  if (expr?.type === 'CallExpression'
    && expr.callee?.type === 'Identifier'
    && expr.callee.name === 'require'
    && expr.arguments?.length === 1) {
    if (scope && adapter?.hasBinding?.(scope, 'require')) return null;
    return adapter.getStringValue(expr.arguments[0]);
  }
  // await import('core-js/...') as a top-level statement (ESM top-level await).
  // bare `import('...')` without await/then is intentionally ignored - it would discard
  // the returned promise and create an unhandled rejection, so it's not a real-world entry shape
  if (expr?.type === 'AwaitExpression') return importExpressionSource(expr.argument, adapter);
  return null;
}

// core-js ships only `.js` files; the trailing `/index` collapses when users reference a
// directory-style entry path (`core-js/stable/array/index` === `core-js/stable/array`)
const canonicalizeEntrySubpath = s => s.replace(/\.js$/, '').replace(/\/index$/, '');

// `?v=123` / `#hash` suffixes are Vite/webpack cache-bust markers, not part of the entry path.
// match `source` against `<pkg>/<subPrefix><rest>` where `pkg` is one of `pkgs`;
// returns canonicalized `<rest>` or null when no prefix matches or `<rest>` is empty
function matchEntrySubpath(source, pkgs, subPrefix) {
  const clean = stripQueryHash(source);
  for (const pkg of pkgs) {
    const pkgPrefix = `${ pkg }/`;
    if (!clean.startsWith(pkgPrefix)) continue;
    const afterPkg = clean.slice(pkgPrefix.length);
    if (!afterPkg.startsWith(subPrefix)) return null;
    return canonicalizeEntrySubpath(afterPkg.slice(subPrefix.length)) || null;
  }
  return null;
}

function defaultSpecifierName(node) {
  // `import X from` and `import { default as X } from` bind the same module export;
  // the latter form (Babel's own codegen for transpiled defaults) must dedup too
  const spec = node.specifiers?.find(s => s.type === 'ImportDefaultSpecifier'
    || (s.type === 'ImportSpecifier' && (s.imported?.name ?? s.imported?.value) === 'default'));
  return spec?.local?.name ?? null;
}

// dual-API stub: Babel (`getBindingIdentifier`) + ESTree (`hasBinding`) adapters
const REQUIRE_SHADOWED_SCOPE = { hasBinding: () => true, getBindingIdentifier: () => true };

// callback receives the AST node so callers can remove+re-emit in canonical order -
// the only load-order-correct option when user polyfill A and plugin-injected B depend
// on each other in either direction.
// pure-import dedup / super-method mapping is scoped to the main package only:
// `additionalPackages` are monorepo aliases / vendor forks the user picked deliberately,
// so their bindings stay inert and their `super.X` stays with the fork's own semantics
export function scanExistingCoreJSImports(ast, { packages, pkg, mode, adapter, onGlobalImport, onPureImport }) {
  // `packages` is lowercased in the resolver; mirror that so config `package: '@My/Fork'`
  // still matches the user's source literal when they typed the lowercase canonical form
  const mainPkgs = pkg ? [pkg.toLowerCase()] : null;
  const modePrefix = mode ? `${ mode }/` : null;
  const shadowScope = declaresRequireBinding(ast.body) ? REQUIRE_SHADOWED_SCOPE : null;
  for (const node of ast.body ?? []) {
    if (node.type === 'ImportDeclaration' && node.specifiers?.length) {
      if (!onPureImport || !mainPkgs || !modePrefix) continue;
      const source = adapter.getStringValue(node.source);
      if (typeof source !== 'string') continue;
      const name = defaultSpecifierName(node);
      if (!name) continue;
      const entry = matchEntrySubpath(source, mainPkgs, modePrefix);
      if (entry) onPureImport(entry, name, node);
      continue;
    }
    const source = getEntrySource(node, adapter, shadowScope);
    if (typeof source !== 'string') continue;
    const mod = matchEntrySubpath(source, packages, 'modules/');
    if (mod) onGlobalImport?.(mod, node);
  }
}

export function checkTypeAnnotations(node, onGlobal) {
  if (node.typeAnnotation) walkTypeAnnotationGlobals(node.typeAnnotation, onGlobal);
  if (node.returnType) walkTypeAnnotationGlobals(node.returnType, onGlobal);
  if (node.params) {
    for (const param of node.params) {
      const p = param.type === 'AssignmentPattern' ? param.left : param;
      if (p.typeAnnotation) walkTypeAnnotationGlobals(p.typeAnnotation, onGlobal);
    }
  }
  if (node.typeParameters?.params) {
    for (const p of node.typeParameters.params) {
      if (p.constraint) walkTypeAnnotationGlobals(p.constraint, onGlobal);
      if (p.default) walkTypeAnnotationGlobals(p.default, onGlobal);
    }
  }
  if (node.superTypeParameters) walkTypeAnnotationGlobals(node.superTypeParameters, onGlobal);
}
