import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _globalThis from "@core-js/pure/actual/global-this";
// `const A = Promise satisfies typeof Promise` — TSSatisfiesExpression variant of M-15.
// same treatment as `as` cast: `unwrapClassExpr` strips TS wrapper so alias chain
// resolves through to Promise.try and gets polyfilled via super-import mapping
const A = _Promise;
class C extends A {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}
_globalThis.__r = C.run();