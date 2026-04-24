import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `const { Promise: MyP = Fallback } = globalThis` - destructure with default value.
// findDestructureKeyForBinding unwraps AssignmentPattern.left to check the binding name.
// super.try should still polyfill to Promise.try because MyP resolves through the
// destructure key 'Promise' on a proxy-global root.
const MyP = _Promise === void 0 ? class {} : _Promise;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}