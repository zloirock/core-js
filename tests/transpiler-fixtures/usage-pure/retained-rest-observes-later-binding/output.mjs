import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _WeakMap from "@core-js/pure/actual/weak-map";
// The rest copy runs before the following constructor binding is initialized.
// Its getter observes TDZ even when an earlier static is extracted.
function observe() {
  try {
    note(typeof W);
  } catch (error) {
    note(_nameMaybeFunction(error));
  }
  return 7;
}
Object.defineProperty(Number, 'orderProbe', {
  enumerable: true,
  get: observe
});
const {
  Number: _ref
} = (note('prefix'), _globalThis);
const {} = _ref;
const isInteger = _Number$isInteger;
const {
  isInteger: _unused,
  ...numbers
} = _ref;
const W = _WeakMap;
use(isInteger, numbers, W);