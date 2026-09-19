import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `const A = globalThis.Promise; class C extends A` - alias to proxy-global member
// still resolves `A` as the global `Promise`, so `super.try(r)` inside the class body
// picks up the `Promise.try` polyfill.
const A = _Promise;
class C extends A {
  static run(r) {
    return _Promise$try.call(this, r);
  }
}