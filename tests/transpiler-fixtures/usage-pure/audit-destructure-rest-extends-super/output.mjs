import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
const MyP = _Promise;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const {
  Promise: _unused,
  ...rest
} = _globalThis;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}