// user namespace with a proxy-global chain as the property value:
// `const NS = { P: globalThis.Promise }`. unified resolver handles the composition -
// walks NS init, recurses on `globalThis.Promise` MemberExpression which falls through
// to the proxy-global walker. `super.try(...)` routes through the Promise polyfill
const NS = { P: globalThis.Promise };
class C extends NS.P {
  static run() { return super.try(() => 1); }
}
