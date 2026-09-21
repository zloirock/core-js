import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// The realm default supplies the constructor polyfill beside a native nested method.
// A supplied object keeps its own constructor and nested read.
export function read({
  Math: {
    floor
  },
  Set: Ctor
} = {
  Math: _globalThis.Math,
  Set: _Set
}) {
  return [floor(1.9), new Ctor()];
}
export const out = read();