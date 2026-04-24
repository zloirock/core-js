import _Promise from "@core-js/pure/actual/promise/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$try from "@core-js/pure/actual/promise/try";
const MyP = _Promise;
// `const { Promise, ...rest } = globalThis` - rest element alongside the aliased
// property. findDestructureKeyForBinding's loop only considers Property / ObjectProperty
// nodes, skipping RestElement correctly. Should still resolve Promise -> super.try polyfill.
const {
  Promise: _unused,
  ...rest
} = _globalThis;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}