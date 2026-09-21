import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// A claim-free nested read does not prevent the default from mirroring the constructor.
// Math.floor stays native and Set binds the ponyfill.
function read({
  Math: {
    floor
  },
  Set
} = {
  Math: _globalThis.Math,
  Set: _Set
}) {
  return [floor(1.9), new Set()];
}
export const out = read();