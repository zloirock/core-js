import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const w = choice ? _globalThis : null;
  return w === _globalThis ? _isIterable([3]) : w.Symbol.iterator in [3];
}