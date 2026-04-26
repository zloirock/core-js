// AST-pattern resolvers shared across detect-usage submodules. covers the core walk
// primitives (`unwrapParens`, `unwrapParensCollectingEffects`, `isStaticPlacement`),
// binding-to-global resolution (`resolveBindingToGlobal` and friends), and the high-level
// resolvers used by callers (`resolveKey`, `resolveObjectName`, `patternBindingName`,
// `findProxyGlobal`, `createSelfRefVarGuard`). also hosts Symbol-ref helpers
// (`resolvesToGlobalSymbol`, `asSymbolRef`) consumed by the members submodule
import {
  POSSIBLE_GLOBAL_OBJECTS,
  TS_EXPR_WRAPPERS,
  globalProxyMemberName,
  kebabToCamel,
  mayHaveSideEffects,
  singleQuasiString,
} from '../helpers.js';

// same ceiling as `resolve-node-type.MAX_DEPTH`; 10 is too low for cross-module alias chains.
// exported so cohort recursive walkers (`isSymbolSourcedKey` in members.js) share the bound
export const MAX_KEY_DEPTH = 64;

// transparent wrapper types - both unwrap modes peel them identically
const TRANSPARENT_WRAPPER_TYPES = new Set(['ParenthesizedExpression', 'ChainExpression']);

export function isTransparentWrapper(node) {
  return TRANSPARENT_WRAPPER_TYPES.has(node.type) || TS_EXPR_WRAPPERS.has(node.type);
}

// SequenceExpression bail mode: stop unwrapping when preceding elements carry side effects.
// caller can't preserve them (inner resolveKey recursion, handleBinaryIn) - keep sequence intact
export function unwrapParens(node) {
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
export function unwrapParensCollectingEffects(node, effects) {
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

export function isStaticPlacement(name) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(name)) return 'static';
  if (name[0] >= 'A' && name[0] <= 'Z') return 'static';
  return null;
}

// capitalised-identifier probe for polyfillHint values like `Symbol`/`Map`/`Promise`
const CAPITALISED_IDENT = /^[A-Z]\w*$/;
// `import _Foo from 'core-js/pure/symbol/iterator'` - extract Symbol key from polyfill path.
// `.[cm]?js` suffix is tolerated (explicit-extension import styles under TS-aware bundlers).
// path must EITHER start with a known core-js package prefix OR with an internal core-js
// namespace (`actual/`, `es/`, etc.). babel's injector stores importSource without the
// package prefix (`actual/symbol/iterator`); unplug stores the full path. without this
// constraint, `my-lib/symbol/iterator` was misclassified as Symbol.iterator (DUI-9-03)
const CORE_JS_SOURCE_PREFIX = /^(?:core-js(?:-pure)?\/|@core-js\/pure\/|(?:actual|es|features|full|proposals|stable|stage)\/)/;
const SYMBOL_IMPORT_SOURCE = /(?:^|\/)symbol\/(?<name>[\w-]+)(?:\/index)?(?:\.[cm]?js)?$/;

const IMPORT_BINDING_TYPES = new Set(['ImportSpecifier', 'ImportDefaultSpecifier', 'ImportNamespaceSpecifier']);

// true when `node` binds the module's default export (either as default specifier or
// as named `default` re-export). namespace bindings and other named specifiers reject -
// they alias something other than the module's default, even if the module-source matches.
// `null` is accepted as "default-like" for adapter-supplied virtual bindings: the plugin
// only emits virtual bindings for its own default pure-imports, and reference-tracking
// / super-mapping rely on this helper returning true in that case
export function bindsModuleDefault(node) {
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
// export the well-known Symbol as their default - only default bindings count as Symbol.X refs.
// CORE_JS_SOURCE_PREFIX filter rejects unrelated user imports like `my-lib/symbol/iterator`
// whose `*/symbol/X` suffix would otherwise match the regex and route through Symbol.X polyfill
export function bindingSymbolKey(binding) {
  if (binding.polyfillHint?.startsWith('Symbol.')) return binding.polyfillHint;
  if (!binding.importSource || !CORE_JS_SOURCE_PREFIX.test(binding.importSource)) return null;
  const match = SYMBOL_IMPORT_SOURCE.exec(binding.importSource);
  if (!match || !bindsModuleDefault(binding.node)) return null;
  return `Symbol.${ kebabToCamel(match.groups.name) }`;
}

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
export function asSymbolRef(node, scope, adapter, seen) {
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

// find the proxy global identifier (globalThis, self, etc.) at the root of a MemberExpression chain
export function findProxyGlobal(node) {
  let obj = unwrapParens(node);
  while (obj.type === 'MemberExpression' || obj.type === 'OptionalMemberExpression') obj = unwrapParens(obj.object);
  return obj.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(obj.name) ? obj : null;
}
