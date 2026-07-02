// `super[CONST]` where CONST is a const-bound string literal. static-method lookup
// follows the alias chain through the `const` binding: M -> 'try' -> super.try,
// which resolves to Promise.try and polyfills
const M = 'try';
class C extends Promise {
  static run() { return super[M](() => 1); }
}
