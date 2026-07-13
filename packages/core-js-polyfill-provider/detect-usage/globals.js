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
