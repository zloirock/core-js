import "core-js/modules/es.function.name";
import "core-js/modules/web.self";
// An excluded realm root keeps the same environment-probe guard through stored
// and effect-prefixed carriers. A plain backed hop still folds, and a shadowing
// parameter stays outside the realm rule. Each carrier evaluates its effects once.
let a,
  b,
  c,
  effects = 0;
export const direct = globalThis.self.window?.name;
export const assigned = (a = globalThis).self.window?.location;
export const sequence = (b = (effects++, globalThis)).self.window?.navigator;
export const nested = (effects++, c = globalThis).self.self.window?.document;
export const backed = (a = globalThis).self?.name;
export function shadowed(globalThis) {
  return (a = globalThis).self.window?.name;
}
export { a, b, c, effects };