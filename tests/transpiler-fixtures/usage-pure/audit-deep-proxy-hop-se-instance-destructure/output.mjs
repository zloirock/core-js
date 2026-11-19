import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Instance claims retain their receiver and independent key calls through effectful realm access.
// The quiet computed control retains the existing realm collapse.
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
  return 'self';
}
const callInstance = _flatMaybeArray(_globalThis[eff('a'), 'self'].Array.prototype).call([1, [2]]);
const flatMap = _flatMapMaybeArray(_globalThis[eff('b'), 'self'].Array.prototype);
const deepDouble = _atMaybeArray(_globalThis[eff('c'), 'self'][eff('d'), 'window'].Array.prototype).call([5, 6], 0);
const noSe = _findLastMaybeArray(_self.Array.prototype).call([7], Boolean);
export { callInstance, flatMap, deepDouble, noSe, log };