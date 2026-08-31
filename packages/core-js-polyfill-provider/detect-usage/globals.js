// Known global names (constructors / namespaces / proxy globals)
import builtInDefinitions from '@core-js/compat/built-in-definitions' with { type: 'json' };
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { POSSIBLE_GLOBAL_OBJECTS } from '../helpers/ast-patterns.js';

export const KNOWN_FUNCTION_GLOBALS = new Set([
  ...Object.keys(knownBuiltInReturnTypes.constructors),
  ...Object.keys(knownBuiltInReturnTypes.globalMethods),
]);
export const KNOWN_NAMESPACE_GLOBALS = new Set(knownBuiltInReturnTypes.namespaces);
// every polyfillable global, from built-in-definitions. this is a DIFFERENT axis than
// known-built-in-return-types (KNOWN_FUNCTION_GLOBALS), which catalogues names by inferred return
// type: the two overlap but neither contains the other - return-types lists always-present built-ins
// (Array / Boolean / Date / ...) that aren't injectable globals, and omits injectable globals it
// tracks no return type for (Iterator / AsyncIterator / structuredClone / setImmediate). without
// this set a self-reference `var Iterator = Iterator` injects nothing
const INJECTABLE_GLOBALS = new Set(Object.keys(builtInDefinitions.globals));

// the `Symbol.<key>` statics core-js ships an entry for - the allowlist a `symbol/<kebab>` module
// path is checked against before a binding to it counts as that static's VALUE. the catalogue
// shape alone cannot decide it: `symbol/constructor` default-exports the Symbol constructor,
// `symbol/description` exports nothing (side-effect module) and `symbol/index` is the whole
// namespace, so a path-only match reads all three as well-known symbols
export const SYMBOL_STATIC_KEYS = new Set(Object.keys(builtInDefinitions.statics.Symbol));

// covers constructors / global methods / namespaces / proxy globals - any polyfillable name
export function isKnownGlobalName(name) {
  return KNOWN_FUNCTION_GLOBALS.has(name) || KNOWN_NAMESPACE_GLOBALS.has(name)
    || POSSIBLE_GLOBAL_OBJECTS.has(name) || INJECTABLE_GLOBALS.has(name);
}

// receiverHint for a property meta - gates the resolver's instance-method fallback. only a
// STATIC-position access carries a hint (prototype/instance dispatch narrows by the real receiver
// type via enhanceMeta instead). a constructor yields 'function', a namespace / proxy-global yields
// 'object': `Array.concat` -> 'function', and concat (an `Array.prototype` method, absent on the
// `Array` constructor) has no function-variant so the resolver bails; `Array.name` -> 'function'
// resolves via the genuine `Function.prototype` variant. an unknown / non-static receiver -> null,
// leaving the resolver's default fold (e.g. `NaN.toFixed` - NaN is a Number value, not a constructor)
export function staticReceiverHint(placement, objectName) {
  if (placement !== 'static' || !objectName) return null;
  if (KNOWN_FUNCTION_GLOBALS.has(objectName)) return 'function';
  if (KNOWN_NAMESPACE_GLOBALS.has(objectName) || POSSIBLE_GLOBAL_OBJECTS.has(objectName)) return 'object';
  return null;
}

// Symbol.iterator `in`-fold canon entry (`Symbol.iterator in x` -> `_isIterable(x)`)
export const IS_ITERABLE_ENTRY = 'is-iterable';
// direct-fetch iterator canon entry (`node[Symbol.iterator]()` -> `_getIterator(node)`)
export const GET_ITERATOR_ENTRY = 'get-iterator';

// the resolution of a symbol-sourced `[Symbol.iterator]` member meta. the pure package has no
// `symbol/instance/iterator` entry (the method form IS the canonical access, dispatched on its
// own), so this constant IS the resolution - both emitters consume it wherever a kind-driven
// gate or an extraction render needs the instance shape, instead of each synthesizing the
// triple locally
export const SYMBOL_ITERATOR_PURE_RESULT = { kind: 'instance', entry: 'get-iterator-method', hintName: 'getIteratorMethod' };

// the `$helper` entries of the pure package that detection resolves to as the EMIT CANON itself
// (`resolveSymbolIteratorEntry` / `resolveSymbolInEntry` + `SYMBOL_ITERATOR_PURE_RESULT`).
// `isEntryNeeded` exempts them from a user `exclude`: filtering the entry must not flip the
// canonical emit to a raw static-symbol read - the helper wraps native lookups and stays correct
// with its polyfill modules filtered. the other `$helper` entries of the package
// (`function/name`, `regexp/flags`) are NOT here: detection resolves those reads to the
// instance-wrapper entries instead, so the plugins never inject them
export const HELPER_CANON_ENTRIES = new Set([
  GET_ITERATOR_ENTRY,
  SYMBOL_ITERATOR_PURE_RESULT.entry,
  IS_ITERABLE_ENTRY,
]);

// `Symbol.hasInstance` -> `symbol/has-instance`. pure string transform - caller must
// validate the entry exists via the resolver. lowercase first char to filter malformed
// inputs (`Symbol.XYZ` -> `symbol/-x-y-z` would silently miss the lookup)
export function symbolKeyToEntry(key) {
  if (!key?.startsWith('Symbol.')) return null;
  const prop = key.slice(7);
  if (!prop || prop[0] < 'a' || prop[0] > 'z') return null;
  return `symbol/${ prop.replaceAll(/[A-Z]/g, c => `-${ c.toLowerCase() }`) }`;
}
