import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// The static binding is defined, but the earlier window probe still guards the whole chain.
export function optionalTail() {
  let held;
  const value = (held = globalThis.window)?.self.Array.from?.([effect()]).at?.(0);
  return [held, value];
}
export function plainTail() {
  return globalThis.window?.Array.of?.(2).at(0);
}
export function doubleOptional() {
  return globalThis.window?.Array?.from?.([3]).at?.(0);
}
export function computedKey() {
  return globalThis.window?.Array[effect(), 'from']?.([4]).at?.(0);
}
// A returned undefined still throws at the next plain member; only the root short-circuits.
export function undefinedValue() {
  return globalThis.window?.Array.of?.().at(0).at?.(0);
}
// Parentheses end the chain, so an absent window makes the outer read throw.
export function sealed() {
  return (globalThis.window?.Array.from?.([1])).at?.(0);
}