import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a MUTATED proxy hop keeps the chain raw AND the type channel drops to the generic
// dispatcher (a type-specific helper would dispatch pristine array methods on the fake)
_globalThis.self = {
  Array: FakeArray
};
const arr = new _globalThis.self.Array(3);
use(_at(arr).call(arr, 0), _includes(arr).call(arr, 2));
export { arr };