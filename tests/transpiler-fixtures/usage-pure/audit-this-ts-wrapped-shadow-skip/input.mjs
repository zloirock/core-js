// `(this as any).at(0)` and `this!.at(0)` - TS wrappers around `this`. shadow check
// must peel TS as-cast / TS non-null assertion (!) so the user-declared `at` method on
// the class isn't bypassed by the polyfill rewrite. covers the TS-wrapper variant of
// the paren-wrapped fixture
class C extends Array {
  at() { return 'shadowed'; }
  foo() { return (this as any).at(0); }
  bar() { return this!.at(1); }
}
