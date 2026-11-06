import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// multi-step alias `const B = A; const A = (Promise); class C extends B` - super.try(r)
// inside C must route to the Promise polyfill by walking the alias chain through parens
const A = _Promise;
const B = A;
class C extends B {
  static run(r) {
    return _Promise$try.call(this, r);
  }
}