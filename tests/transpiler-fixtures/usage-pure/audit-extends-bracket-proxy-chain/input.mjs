// `globalThis['self'].Promise` - bracket-computed string key in a proxy-global
// chain must still be recognised, so `extends` is treated as `extends Promise`
// and `super.try(...)` is rewritten to the Promise.try polyfill
class C extends globalThis['self'].Promise {
  static run(r) { return super.try(r); }
}
