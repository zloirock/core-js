import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a computed destructure key `const { [k]: MyP } = R` (k resolves to "Promise") binds MyP to
// R.Promise, so extends MyP resolves to the global Promise and super.try rewrites to promise/try
const k = "Promise";
const R = {
  Promise: _Promise
};
const {
  [k]: MyP
} = R;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}