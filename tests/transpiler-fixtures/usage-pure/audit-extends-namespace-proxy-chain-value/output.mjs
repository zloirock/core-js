import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// user namespace with a proxy-global chain as the property value:
// `const NS = { P: globalThis.Promise }`. unified resolver handles the composition -
// walks NS init, recurses on `globalThis.Promise` MemberExpression which falls through
// to the proxy-global walker. `super.try(...)` routes through the Promise polyfill
const NS = {
  P: _Promise
};
class C extends NS.P {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}