import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `resolveSuperClassName` alias chain terminates on proxy-global member: `globalThis.Promise`
// is a proxy-global init, so the walk returns `Promise` (via `globalProxyMemberName`) instead
// of bailing on non-Identifier init
const P = _Promise;
class C extends P {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}