import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `class C extends MyP` where MyP comes from a user-namespace destructure `const { Promise: MyP } = NS`,
// NS being a const-bound object containing the real Promise. The superclass resolver must
// synthesize the equivalent `NS.Promise` member access and resolve through the unified
// namespace walker - otherwise the destructure-key info is lost and `super.try()` falls
// through without emitting the Promise.try polyfill
const NS = {
  Promise: _Promise
};
const {
  Promise: MyP
} = NS;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}
C.run();