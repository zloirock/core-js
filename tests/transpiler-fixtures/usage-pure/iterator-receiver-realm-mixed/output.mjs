import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const w = choice ? _globalThis : {
    Symbol: {
      iterator: "slot"
    }
  };
  const list = [3];
  return w === _globalThis ? _isIterable(list) : w.Symbol.iterator in list;
}