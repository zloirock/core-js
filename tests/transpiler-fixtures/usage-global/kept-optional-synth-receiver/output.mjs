import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A kept optional host guards a synthesized argument and its key effects. An unresolved
// sibling uses one memo; prefixes precede the probe, and fallback effects stay conditional.
let hits = 0;
let full;
export const of = (({
  of
} = {}) => of)((full = globalThis.window)?.[hits++, 'self'].Array ?? {});
let partial;
export const from = (({
  from,
  customZ
} = {}) => [from, customZ])((partial = globalThis.window)?.[hits++, 'self'].Array ?? {});
let prefixed;
export const values = (({
  values
} = {}) => values)((hits += 10, prefixed = globalThis.window)?.[hits++, 'self'].Object || (hits += 100, {}));
export { hits };