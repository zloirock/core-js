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
  getSuperTypeArgs,
  globalProxyMemberName,
  kebabToCamel,
  mayHaveSideEffects,
  singleQuasiString,
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

// true when `node` binds the module's default export (either as default specifier or
// as named `default` re-export). namespace bindings and other named specifiers reject -
// they alias something other than the module's default, even if the module-source matches.
// `null` is accepted as "default-like" for adapter-supplied virtual bindings: the plugin
// only emits virtual bindings for its own default pure-imports, and reference-tracking
// / super-mapping rely on this helper returning true in that case
function bindsModuleDefault(node) {
  if (!node) return true;
  if (node.type === 'ImportDefaultSpecifier') return true;
  if (node.type === 'ImportSpecifier') {
    const importedName = node.imported?.name ?? node.imported?.value;
    return !importedName || importedName === 'default';
  }
  return false;
}

// resolve a plugin-managed binding to its Symbol.X key if any. covers two markers:
// `polyfillHint` (in-place AST mutation leaves this on the binding) and `importSource`
// (real `import X from '.../symbol/iterator'` that the plugin emitted). symbol modules
// export the well-known Symbol as their default - only default bindings count as Symbol.X refs
function bindingSymbolKey(binding) {
  if (binding.polyfillHint?.startsWith('Symbol.')) return binding.polyfillHint;
  const match = binding.importSource && SYMBOL_IMPORT_SOURCE.exec(binding.importSource);
  if (!match || !bindsModuleDefault(binding.node)) return null;
  return `Symbol.${ kebabToCamel(match.groups.name) }`;
}

// LHS of `Map ||= ...` reads the global before polyfill loads (ReferenceError); the
// import binding is read-only anyway, so substitution also throws at write time
export function checkLogicalAssignLhsGlobal(identifier, parent, isBound) {
  if (isBound || identifier?.type !== 'Identifier' || !isKnownGlobalName(identifier.name)) return null;
  if (parent?.type !== 'AssignmentExpression' || parent.left !== identifier) return null;
  if (!LOGICAL_ASSIGN_OPERATORS.has(parent.operator)) return null;
  return `\`${ identifier.name } ${ parent.operator } ...\` left-hand side cannot be polyfilled `
    + `(read-only import binding); expected runtime engine to provide \`${ identifier.name }\``;
}

// `globalThis.Map ||= X` - MemberExpression LHS form. called from MemberExpression visitor
// before inner-identifier transformation mutates `globalThis` -> `_globalThis`; receiver and
// property still carry their pre-transform names at this visitation point.
// `isBound` signals that the receiver binds to a user-declared local (`const globalThis = {}`
// style shadowing) - treat the member assignment as user-object write, not a real global reach
export function checkLogicalAssignLhsMember(memberNode, parent, isBound) {
  if (isBound || !memberNode || memberNode.type !== 'MemberExpression' || memberNode.computed) return null;
  const obj = memberNode.object;
  const prop = memberNode.property;
  if (obj?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(obj.name)) return null;
  if (prop?.type !== 'Identifier' || !isKnownGlobalName(prop.name)) return null;
  if (parent?.type !== 'AssignmentExpression' || parent.left !== memberNode) return null;
  if (!LOGICAL_ASSIGN_OPERATORS.has(parent.operator)) return null;
  return `\`${ obj.name }.${ prop.name } ${ parent.operator } ...\` left-hand side cannot be polyfilled `
    + `(plugin rewrites reads, not writes); expected runtime engine to provide \`${ prop.name }\``;
}

// same ceiling as `resolve-node-type.MAX_DEPTH`; 10 is too low for cross-module alias chains
const MAX_KEY_DEPTH = 64;

// transparent wrapper types - both unwrap modes peel them identically
const TRANSPARENT_WRAPPER_TYPES = new Set(['ParenthesizedExpression', 'ChainExpression']);

function isTransparentWrapper(node) {
  return TRANSPARENT_WRAPPER_TYPES.has(node.type) || TS_EXPR_WRAPPERS.has(node.type);
}

// SequenceExpression bail mode: stop unwrapping when preceding elements carry side effects.
// caller can't preserve them (inner resolveKey recursion, handleBinaryIn) - keep sequence intact
function unwrapParens(node) {
  while (node) {
    if (isTransparentWrapper(node)) {
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      const preceding = node.expressions.slice(0, -1);
      if (preceding.some(mayHaveSideEffects)) break;
      node = node.expressions.at(-1);
    } else break;
  }
  return node;
}

// SequenceExpression collect mode: push side-effect preceding elements into `effects` for
// the caller to re-attach via a SequenceExpression wrap around the polyfill replacement
function unwrapParensCollectingEffects(node, effects) {
  while (node) {
    if (isTransparentWrapper(node)) {
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      for (const e of node.expressions.slice(0, -1)) if (mayHaveSideEffects(e)) effects.push(e);
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

const IMPORT_BINDING_TYPES = new Set(['ImportSpecifier', 'ImportDefaultSpecifier', 'ImportNamespaceSpecifier']);

function resolveBindingToGlobal(name, scope, adapter, seen) {
  if (!seen) seen = new Set();
  if (seen.has(name)) return null;
  seen.add(name);
  // single binding lookup - reused by polyfillHint, type gate, and VariableDeclarator init walk
  const binding = adapter.getBinding(scope, name);
  // plugin-managed pure-import mutation (`globalThis` -> `_globalThis` / `Symbol` -> `_Symbol`)
  // leaves a real import binding; adapter's `polyfillHint` carries the source global name so
  // downstream proxy-global / constructor recognition survives the rewrite
  const hint = binding?.polyfillHint;
  if (hint && (CAPITALISED_IDENT.test(hint) || POSSIBLE_GLOBAL_OBJECTS.has(hint))) return hint;
  const bindingType = adapter.getBindingNodeType(scope, name);
  // imports without a polyfillHint don't map to a known global (their binding could point at
  // any user-imported value); param / catch / class name fall through to the final null
  if (IMPORT_BINDING_TYPES.has(bindingType)) return null;
  if (bindingType === 'VariableDeclarator') return resolveVariableBindingToGlobal(name, binding, scope, adapter, seen);
  return null;
}

function resolveVariableBindingToGlobal(name, binding, scope, adapter, seen) {
  // check constantViolations before dereferencing `.node.init/.id` - malformed
  // binding shapes can leave those undefined
  if (binding.constantViolations?.length) return null;
  const { init } = binding.node;
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
  if (!init) return null;
  // parens/chain/TS wrappers vanish; SequenceExpression pulls the effective value out
  // only when the preceding expressions are side-effect-free
  const unwrapped = unwrapParens(init);
  if (unwrapped?.type === 'Identifier') {
    // self-reference (`var Map = Map`) -> global; unbound -> global; bound -> follow chain
    // (recursion hits the top-level polyfillHint translation for plugin-managed imports)
    if (unwrapped.name === name || !adapter.hasBinding(scope, unwrapped.name)) return unwrapped.name;
    return resolveBindingToGlobal(unwrapped.name, scope, adapter, seen);
  }
  if (unwrapped?.type === 'MemberExpression' || unwrapped?.type === 'OptionalMemberExpression') {
    return resolveObjectName(unwrapped, scope, adapter, seen);
  }
  return null;
}

// `const { X } = globalThis` (or `self` / `window` / ...) -> X resolves to globalThis.X.
// returns the property key or null when init isn't a proxy-global or `name` isn't matched.
// nested patterns (`const { A: { B } }`) are not followed - conservative single-level alias only.
// only known-global-shaped keys (capitalised / `POSSIBLE_GLOBAL_OBJECTS`) returned -
// `const { foo } = globalThis` should not push `'foo'` into downstream global lookups
function resolveProxyGlobalDestructureAlias(pattern, init, name, scope, adapter, seen) {
  const receiver = resolveObjectName(init, scope, adapter, seen);
  if (!receiver || !POSSIBLE_GLOBAL_OBJECTS.has(receiver)) return null;
  for (const p of pattern.properties) {
    if (p.type !== 'Property' && p.type !== 'ObjectProperty') continue;
    if (patternBindingName(p.value) !== name) continue;
    // propagate `seen` so computed keys backed by chained aliases (`const k = A; const A = k;`
    // -> { [k]: x }) reuse the outer cycle guard instead of starting a fresh walk
    const key = resolveKey(p.key, p.computed, scope, adapter, seen);
    return key && isStaticPlacement(key) ? key : null;
  }
  return null;
}

// top-level binding name of a destructuring element, skipping `=default` wrappers. nested
// patterns (`[a, b]`, `{x, y}`) don't produce a single name and return null
export function patternBindingName(node) {
  while (node?.type === 'AssignmentPattern') node = node.left;
  return node?.type === 'Identifier' ? node.name : null;
}

// walks a chain of proxy-global links (`globalThis.self.window.X`) to its root identifier;
// returns true when the root is a proxy global and every intermediate link is also one
function resolveProxyGlobalRoot(receiver, scope, adapter, seen) {
  let obj = unwrapParens(receiver);
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') {
    // carry `seen` into computed-key resolution so a shared alias chain across the
    // proxy-global walk and its intermediate member keys can't exceed the cycle guard
    const memberKey = obj.computed ? resolveKey(obj.property, true, scope, adapter, seen) : obj.property?.name;
    if (!memberKey || !POSSIBLE_GLOBAL_OBJECTS.has(memberKey)) return false;
    obj = unwrapParens(obj.object);
  }
  return obj.type === 'Identifier' && isProxyGlobalIdentifier(obj, scope, adapter, seen);
}

// `seen` threaded from resolveBindingToGlobal so cyclic const chains
// (`const a = b.x; const b = a.x;`) don't restart the cycle guard and stack-overflow
export function resolveObjectName(objectNode, scope, adapter, seen) {
  objectNode = unwrapParens(objectNode);
  if (objectNode.type === 'Identifier') {
    if (adapter.hasBinding(scope, objectNode.name)) return resolveBindingToGlobal(objectNode.name, scope, adapter, seen);
    // no binding - global only if starts with uppercase or is a known global proxy
    return isStaticPlacement(objectNode.name) ? objectNode.name : null;
  }
  if (objectNode.type !== 'MemberExpression' && objectNode.type !== 'OptionalMemberExpression') return null;
  // computed: globalThis[`Array`] resolves the bracket expression; non-computed reads the
  // identifier name directly. either way the receiver chain must bottom out on a proxy global
  const propertyName = objectNode.computed
    ? resolveKey(objectNode.property, true, scope, adapter)
    : objectNode.property.type === 'Identifier' ? objectNode.property.name : null;
  if (!propertyName) return null;
  return resolveProxyGlobalRoot(objectNode.object, scope, adapter, seen) ? propertyName : null;
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
    const single = singleQuasiString(node);
    if (single !== null) return single;
    let out = '';
    for (let i = 0; i < node.quasis.length; i++) {
      // tagged template with invalid escape (`\\xZ`, `\\u{...}`) leaves `cooked === null`
      // post-ES2018. bailing here is right - the cooked form is what runtime concat would
      // see, so we can't form a valid lookup key without it
      const { cooked } = node.quasis[i].value;
      if (cooked === null || cooked === undefined) return null;
      out += cooked;
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
    // fork `seen` even when caller supplied one: caller may fall through to sibling
    // branches (BinaryExpression `+`, TemplateLiteral expressions) after this Identifier
    // branch - mutating shared state would pollute those independent walks
    const nextSeen = new Set(seen);
    nextSeen.add(node.name);
    const binding = adapter.getBinding(scope, node.name);
    if (binding && !binding.constantViolations?.length) {
      if (binding.node?.type === 'VariableDeclarator') {
        const { init } = binding.node;
        if (init) return resolveKey(init, true, scope, adapter, nextSeen, depth + 1);
      }
      // plugin-managed binding - either via `polyfillHint` (in-place AST mutation)
      // or real import from `core-js/.../symbol/X`
      const key = bindingSymbolKey(binding);
      if (key) return key;
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
  // fork `seen` per side so shared-binding probe (e.g. `obj[s[s]]` re-entering `s`) doesn't
  // trip the cycle guard on the second side after the first side populated the Set. mirrors
  // the TemplateLiteral / `+` branches above
  if (computed && (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
    && asSymbolRef(node.object, scope, adapter, new Set(seen))) {
    const name = resolveKey(node.property, node.computed, scope, adapter, new Set(seen), depth + 1);
    if (name) return `Symbol.${ name }`;
  }
  return null;
}

// bare unbound `Symbol` / capitalised const-alias (`const Sym = Symbol`) /
// proxy-global access (`globalThis.Symbol`, `self.window.Symbol`). lowercase idents skip
// the const-chain walk - `Symbol` aliases are capitalised by convention.
// `seen` threaded through so callers caught in a cyclic const-alias chain
// (`const a = b.Symbol; const b = a;`) don't restart the cycle guard
function resolvesToGlobalSymbol(node, scope, adapter, seen) {
  if (node.type === 'Identifier') {
    if (node.name === 'Symbol') return !adapter.hasBinding(scope, 'Symbol');
    if (!CAPITALISED_IDENT.test(node.name)) return false;
    return resolveBindingToGlobal(node.name, scope, adapter, seen) === 'Symbol';
  }
  return globalProxyMemberName(node, scope, adapter) === 'Symbol';
}

// preserve pre-unwrap node so callers can seed both forms into handledObjects;
// Set dedup absorbs the duplicate when raw === unwrapped
function asSymbolRef(node, scope, adapter, seen) {
  const unwrapped = unwrapParens(node);
  return unwrapped && resolvesToGlobalSymbol(unwrapped, scope, adapter, seen) ? { raw: node, unwrapped } : null;
}

// `var X = X` - hoisted var init references its own name, which at runtime reads the
// outer (global) scope before the local is assigned. Factory wraps a per-binding cache
// because the usage transform mutates `init.name` (X -> _X) after the first visit, so a
// non-cached recheck on later references would miss the invariant.
// `getKind` varies by adapter: babel has `binding.kind`, estree-toolkit reads `kind` off
// the parent VariableDeclaration.
// intentionally `var`-only: `let`/`const` self-ref (`let X = X`) hits the TDZ at runtime,
// so plugin shouldn't invent a global mapping. the duplicated shape in `resolveBindingToGlobal`
// for any kind exists because that code path handles the already-mutated binding (post-rewrite
// shape) and needs to resolve through it regardless of kind
export function createSelfRefVarGuard(getKind) {
  const cache = new WeakMap();
  return function isSelfRefVarBinding(binding) {
    const decl = binding?.path?.node ?? binding?.node;
    if (!decl || decl.type !== 'VariableDeclarator') return false;
    if (cache.has(decl)) return cache.get(decl);
    const { id, init } = decl;
    // oxc preserves `ParenthesizedExpression` while babel strips them - peel so
    // `var Promise = (Promise)` matches the self-ref shape in both parsers
    const peeled = unwrapParens(init);
    const result = getKind(binding) === 'var'
      && id?.type === 'Identifier'
      && peeled?.type === 'Identifier'
      && peeled.name === id.name;
    cache.set(decl, result);
    return result;
  };
}

function isImportBinding(name, scope, adapter) {
  if (!adapter.hasBinding(scope, name)) return false;
  const type = adapter.getBindingNodeType(scope, name);
  return type === 'ImportSpecifier' || type === 'ImportDefaultSpecifier' || type === 'ImportNamespaceSpecifier';
}

// direct `X.prototype.Y` -> instance-method meta on X. indirect alias (`const P = X.prototype`
// / `const { prototype: P } = X`) is picked up by type engine's `resolvePrototypeAsInstance`
// via `enhanceMeta`, not here
function tryBuildPrototypeMeta(obj, key, scope, adapter) {
  if (obj.type !== 'MemberExpression' && obj.type !== 'OptionalMemberExpression') return null;
  if (resolveKey(obj.property, obj.computed, scope, adapter) !== 'prototype') return null;
  const protoName = resolveObjectName(obj.object, scope, adapter);
  return protoName ? { kind: 'property', object: protoName, key, placement: 'prototype' } : null;
}

function buildMemberMeta(node, scope, adapter) {
  // collect side effects from both the receiver and the computed-key so a polyfill
  // replacement on this MemberExpression (which discards the whole subtree) can re-emit
  // them via a SequenceExpression wrap in the plugin's emission path
  const sideEffects = [];
  // `obj` is then passed to `resolveObjectName` which calls `unwrapParens` again - idempotent
  // for already-unwrapped Identifier / MemberExpression (O(1) no-op), so the apparent duplicate
  // walk is cheap; avoids threading an "already-unwrapped" flag through every caller
  const obj = unwrapParensCollectingEffects(node.object, sideEffects);
  // `this.#foo` / `obj.#field` - private field access; not a candidate for any polyfill
  // table (keys never carry `#` prefix). skip explicitly so downstream resolver scans
  // don't chase a doomed key lookup
  if (!node.computed && node.property?.type === 'PrivateIdentifier') return null;
  // computed keys may arrive wrapped in TS constructs (`obj[(k) as any]`, `obj[k!]`) -
  // resolveKey can't walk identifier-alias chain through a TS expression wrapper root
  const key = node.computed
    ? resolveKey(unwrapParensCollectingEffects(node.property, sideEffects), true, scope, adapter)
    : node.property.name || node.property.value;
  if (!key || key === 'prototype') return null;
  let meta = tryBuildPrototypeMeta(obj, key, scope, adapter);
  if (!meta) {
    const objectName = resolveObjectName(obj, scope, adapter);
    if (!objectName && obj.type === 'Identifier' && isImportBinding(obj.name, scope, adapter)) return null;
    const placement = objectName ? isStaticPlacement(objectName) : 'prototype';
    meta = { kind: 'property', object: objectName, key, placement };
  }
  if (sideEffects.length) meta.sideEffects = sideEffects;
  return meta;
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
  // only mark when we actually resolved a receiver: meta.object === null means
  // `resolveObjectName` couldn't classify the receiver (unknown local, complex expression)
  // and the receiver identifier-visitor may still need to polyfill it as a standalone global
  if (meta?.object) markHandledObjects(node, handledObjects, suppressProxyGlobals);
  return meta;
}

// `resolveKey` can fold StringLiteral / TemplateLiteral / `+` concat to the string
// `'Symbol.X'`, but none of those are the well-known symbol. this predicate rejects
// string-sourced keys so `'Symbol.iterator' in Array` isn't miscategorised as an
// is-iterable check. parallel to resolveKey's Identifier / MemberExpression branches
// minus the string-folding cases
function isSymbolSourcedKey(node, scope, adapter, seen, depth = 0) {
  if (depth > MAX_KEY_DEPTH) return false;
  node = unwrapParens(node);
  const { type } = node;
  // string-folded sources - plain strings, not the symbol
  if (adapter.isStringLiteral(node) || type === 'TemplateLiteral'
    || (type === 'BinaryExpression' && node.operator === '+')) return false;
  // Symbol[.X] direct / via chained proxy-global - canonical symbol-ref shape.
  // also verify the property reads a well-known symbol name (not `Symbol.someUserKey`):
  // well-known symbols live under specific names exposed by `symbolKeyToEntry`; random
  // dot-access on Symbol (`Symbol.foo`) resolves to `undefined` at runtime and should
  // not trigger symbol-routed polyfill dispatch
  if (type === 'MemberExpression' || type === 'OptionalMemberExpression') {
    if (!asSymbolRef(node.object, scope, adapter, new Set(seen))) return false;
    if (!node.computed && node.property?.type === 'Identifier') {
      return symbolKeyToEntry(`Symbol.${ node.property.name }`) !== null;
    }
    return true;
  }
  if (type !== 'Identifier' || seen?.has(node.name)) return false;
  const nextSeen = seen ?? new Set();
  nextSeen.add(node.name);
  const binding = adapter.getBinding(scope, node.name);
  if (!binding || binding.constantViolations?.length) return false;
  // binding indirection - `const k = Symbol.iterator; k in X` resolves through init
  if (binding.node?.type === 'VariableDeclarator' && binding.node.init) {
    return isSymbolSourcedKey(binding.node.init, scope, adapter, nextSeen, depth + 1);
  }
  // plugin-managed: `polyfillHint` (in-place mutation) or real `core-js/.../symbol/X` import
  return bindingSymbolKey(binding) !== null;
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
    // nested `Symbol[Symbol.X]` - `resolveKey` already returns `Symbol.X`; double-prefixing
    // would build invalid `Symbol.Symbol.X`. user code (`Symbol[Symbol.iterator]` evaluates
    // to undefined regardless) is runtime-broken; bail rather than carry an invalid key
    if (name && !name.includes('.')) {
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
      return { kind: 'in', key, object: null, placement: null, symbolSourced: true };
    }
  }
  // identifier bound to Symbol.X - `const k = Symbol.iterator; k in obj` works regardless of
  // object type. literal-string sources that happen to spell `Symbol.X` (`'Symbol.iterator'`,
  // `` `Symbol.iterator` ``, `'Symbol.' + 'iterator'`) are NOT symbol refs - `isSymbolSourcedKey`
  // filters them out; they fall through to the string-key branch below.
  // single-`.` shape filters out double-prefixed `Symbol.Symbol.X` from nested `Symbol[Symbol.X]`
  const resolvedLeft = resolveKey(node.left, true, scope, adapter);
  if (resolvedLeft?.startsWith('Symbol.') && !resolvedLeft.includes('.', 7)
    && isSymbolSourcedKey(node.left, scope, adapter)) {
    return { kind: 'in', key: resolvedLeft, object: null, placement: null, symbolSourced: true };
  }
  // 'key' in Object - string key in static/global object. fresh `seen` Set because this
  // is a top-level entry point; downstream recursion through `resolveObjectName` reuses it
  if (resolvedLeft) {
    const objectName = resolveObjectName(node.right, scope, adapter, new Set());
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
// peel and record transparent wrappers (TS casts, parens) along the way. polyfill visitor
// lookups land on either form depending on the enclosing visitor, so marking both the wrapper
// and its unwrapped inner matches any of them
function peelMarkedWrappers(node, handledObjects) {
  while (node && isTransparentWrapper(node)) {
    handledObjects.add(node);
    node = node.expression;
  }
  return node;
}

// record the full proxy-global chain (including any wrappers at every level) so the outer
// rewrite that subsumes it doesn't re-fire on the leaves. handles `(globalThis as any).Symbol.iterator`
// and deeper nests like `(self as any)[(...)]` uniformly through `peelMarkedWrappers`
function markSubsumedProxyChain(node, handledObjects) {
  let current = peelMarkedWrappers(node, handledObjects);
  while (current && (current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')) {
    handledObjects.add(current);
    current = peelMarkedWrappers(current.object, handledObjects);
  }
  if (current?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(current.name)) {
    handledObjects.add(current);
  }
}

// mark handled objects after processing a MemberExpression meta
// suppresses duplicate Identifier visitor firing for the object part
// called when `buildMemberMeta` returned truthy meta (receiver + key resolved). even when
// `meta.object === null` (receiver Identifier didn't match `isStaticPlacement` - bound local
// variable), marking the receiver is correct: a local binding shouldn't produce a polyfill
// import via the identifier visitor, so suppression is the right behaviour
function markHandledObjects(node, handledObjects, suppressProxyGlobals) {
  const obj = unwrapParens(node.object);
  if (obj.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(obj.name)) {
    handledObjects.add(obj);
    return;
  }
  if (!suppressProxyGlobals) return;
  // walk down the proxy chain (`globalThis.Object`, `globalThis.self.Promise`, ...) and mark
  // every intermediate MemberExpression so the inner visitor doesn't re-process it. stop at
  // the proxy global leaf itself - it may need its own polyfill when the outer is not polyfilled.
  // usage-global intentionally does NOT suppress intermediate visits: chains like
  // `globalThis.self.Object.keys` rely on the `self` member visit to register `web.self`, which
  // is a real runtime dependency (bare `self` is undefined in workers / strict envs otherwise)
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
  // branch handlers for binary / sequence / conditional shapes recurse with the per-branch
  // expression; pure positional resolution falls through to the type-specific cases below
  switch (unwrapped.type) {
    case 'LogicalExpression':
      return resolveLogicalDestructureMeta(unwrapped, key, scope, adapter);
    case 'SequenceExpression':
      // `(0, Array)`: sequence evaluates to its last expression
      return buildDestructuringInitMeta(unwrapped.expressions.at(-1), key, scope, adapter);
    case 'ConditionalExpression':
      return resolveConditionalDestructureMeta(unwrapped, key, scope, adapter);
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

// `Array ?? X`, `X ?? Array`, `X && Array`: try both branches, prefer the one
// that resolves to a known global (for `??`/`||` the fallback is usually on the right,
// for `&&` it's always the right).
// `fromFallback` disables the destructure replacement when the runtime value may come
// from either branch - `&&` is always conditional (primary only when left truthy, else
// falsy left), so always flag; `??`/`||` flag only when the fallback is the resolved side
function resolveLogicalDestructureMeta(node, key, scope, adapter) {
  const isAnd = node.operator === '&&';
  const primary = isAnd ? node.right : node.left;
  const meta = buildDestructuringInitMeta(primary, key, scope, adapter);
  if (meta.object) {
    if (!isAnd) return meta;
    // `X && Y` where both sides resolve to the SAME known object - runtime value is Y (which
    // is same as X for this property). no fromFallback needed, polyfill is safe to apply.
    // `X && Y` with different resolved objects still bails - `from = (X && Y).from` depends on
    // X's truthiness to pick between X.from and Y.from, different polyfills per branch
    const leftMeta = buildDestructuringInitMeta(node.left, key, scope, adapter);
    if (leftMeta.object === meta.object) return meta;
    return { ...meta, fromFallback: true };
  }
  // for `&&` both primary and fallback are the same (right), no point retrying
  if (isAnd) return meta;
  const fallback = buildDestructuringInitMeta(node.right, key, scope, adapter);
  return fallback.object ? { ...fallback, fromFallback: true } : fallback;
}

// `cond ? Array : Set`: try both branches; flag fromFallback so destructure replacement
// bails (the runtime value depends on `cond`). without this branching, the conditional
// would fall through to the positional case and miss polyfill resolution entirely
function resolveConditionalDestructureMeta(node, key, scope, adapter) {
  const consequent = buildDestructuringInitMeta(node.consequent, key, scope, adapter);
  const alternate = buildDestructuringInitMeta(node.alternate, key, scope, adapter);
  const resolved = consequent.object ? consequent : alternate.object ? alternate : null;
  return resolved ? { ...resolved, fromFallback: true } : consequent;
}

export function canTransformDestructuring({ parentType, parentInit, grandParentType }) {
  if (parentType === 'VariableDeclarator') {
    if (!parentInit) return false; // for-of/for-in - no init
    if (grandParentType === 'ForInStatement' || grandParentType === 'ForOfStatement') return false;
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

// per-node-type: which property holds the bare Identifier that names a type / runtime binding.
// `TSTypeReference.typeName` / `GenericTypeAnnotation.id` - bare type names (Flow vs TS).
// `TSTypeQuery.exprName` - `typeof X` in annotation pulls in the runtime binding `X` as a
// real global reference. qualified names (TSQualifiedName) land on the Identifier `X` in
// `typeof NS.X` through the object position - we deliberately take the root `NS` only when
// it already matches the Identifier shape here
const TYPE_REFERENCE_SLOTS = {
  TSTypeReference: 'typeName',
  GenericTypeAnnotation: 'id',
  TSTypeQuery: 'exprName',
};

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
    const refSlot = TYPE_REFERENCE_SLOTS[node.type];
    const ref = refSlot ? node[refSlot] : null;
    if (ref?.type === 'Identifier') onGlobal(ref.name);
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

// the polyfill replacement consumes `?.`, so the receiver null-check is redundant.
// ESTree (oxc) preserves ParenthesizedExpression around the object (`(globalThis)?.Array`),
// which babel strips - unwrap here so the optimization fires for both parsers
export function isPolyfillableOptional(node, scope, adapter, resolve) {
  const obj = unwrapParens(node.object);
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
  // unwrap outer parens/TS wrappers: `(await import(...))` / `(require(...))` - parsers
  // that preserve `ParenthesizedExpression` would otherwise miss these entry patterns
  const expr = unwrapParens(node.expression);
  // require('core-js/...'); also handles webpack-style `(0, require)('core-js/...')` by
  // peeling the SequenceExpression tail (side-effect-free preceding elements drop out) so
  // tool-generated indirect-require wrappers still register as entries
  if (expr?.type === 'CallExpression' && expr.arguments?.length === 1) {
    let { callee } = expr;
    while (callee?.type === 'ParenthesizedExpression') callee = callee.expression;
    if (callee?.type === 'SequenceExpression') {
      const tail = callee.expressions?.at(-1);
      if (tail && !callee.expressions.slice(0, -1).some(mayHaveSideEffects)) callee = tail;
    }
    if (callee?.type === 'Identifier' && callee.name === 'require') {
      if (scope && adapter?.hasBinding?.(scope, 'require')) return null;
      return adapter.getStringValue(expr.arguments[0]);
    }
  }
  // await import('core-js/...') as a top-level statement (ESM top-level await).
  // bare `import('...')` without await is intentionally ignored: it discards the returned
  // promise (unhandled rejection risk). `import(...).then(cb)` is also ignored - the user
  // explicitly opted into async runtime loading, so replacing the dynamic import with static
  // side-effect imports would erase that async shape; see fixture `audit-dynamic-import-then-skip`
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
  // `pkgs` are lowercased by the caller; apply the same normalisation to the source so user
  // imports with case-mismatched package segments (`'@CORE-JS/PURE/...'`) dedupe against the
  // config's `@core-js/pure/...` entry instead of emitting duplicate default-imports
  const clean = stripQueryHash(source).toLowerCase();
  for (const pkg of pkgs) {
    const pkgPrefix = `${ pkg }/`;
    if (!clean.startsWith(pkgPrefix)) continue;
    const afterPkg = clean.slice(pkgPrefix.length);
    if (!afterPkg.startsWith(subPrefix)) return null;
    return canonicalizeEntrySubpath(afterPkg.slice(subPrefix.length)) || null;
  }
  return null;
}

function defaultSpecifierNames(node) {
  // `import X from` and `import { default as X } from` bind the same module export;
  // a user can legitimately stack both forms on one declaration (`import Def, { default as Alt }
  // from 'x'`) - surface every name so downstream registers both hints, not just the first.
  // per-specifier `importKind: 'type'` (`import { type default as T } from ...`) is type-only;
  // it never reaches runtime, so skip to avoid registering a phantom hint
  const out = [];
  for (const s of node.specifiers ?? []) {
    if (s?.importKind === 'type') continue;
    if (bindsModuleDefault(s) && s.local?.name) out.push(s.local.name);
  }
  return out;
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
      // two shapes of type-only imports: `import type X from '...'` sets declaration-level
      // `importKind: 'type'`; `import { type X } from '...'` sets it per-specifier. both parsers
      // follow the same rule. defaultSpecifierNames already filters per-specifier, so here we
      // only need to skip the declaration-level case. type-only imports are erased at runtime
      // (TS stripping), so dedup'ing against their names would route runtime calls through an
      // undefined binding
      if (node.importKind === 'type' || node.exportKind === 'type') continue;
      const source = adapter.getStringValue(node.source);
      if (typeof source !== 'string') continue;
      const names = defaultSpecifierNames(node);
      if (!names.length) continue;
      const entry = matchEntrySubpath(source, mainPkgs, modePrefix);
      if (entry) for (const name of names) onPureImport(entry, name, node);
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
      // RestElement parser divergence: babel puts `typeAnnotation` directly on the rest
      // element (covered above); oxc TS-ESTree places it on the inner `argument` (Identifier).
      // check both slots so `function f(...args: Array<Foo>)` detects Foo on both parsers
      if (p.type === 'RestElement' && p.argument?.typeAnnotation) {
        walkTypeAnnotationGlobals(p.argument.typeAnnotation, onGlobal);
      }
    }
  }
  if (node.typeParameters?.params) {
    for (const p of node.typeParameters.params) {
      if (p.constraint) walkTypeAnnotationGlobals(p.constraint, onGlobal);
      if (p.default) walkTypeAnnotationGlobals(p.default, onGlobal);
    }
  }
  // class `extends Foo<T>` - Babel: `superTypeParameters`, oxc TS-ESTree: `superTypeArguments`
  const superArgs = getSuperTypeArgs(node);
  if (superArgs) walkTypeAnnotationGlobals(superArgs, onGlobal);
}
