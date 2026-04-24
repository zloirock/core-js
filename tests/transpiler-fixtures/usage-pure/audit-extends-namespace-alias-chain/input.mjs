// chained identifier alias inside user namespace: `const MyP = Promise; const NS = { P: MyP }`.
// resolver recurses on the property value (MyP), which is itself resolved via the identifier
// alias walker. `super.try(...)` still routes through the Promise polyfill through two hops
const MyP = Promise;
const NS = { P: MyP };
class C extends NS.P {
  static run() { return super.try(() => 1); }
}
