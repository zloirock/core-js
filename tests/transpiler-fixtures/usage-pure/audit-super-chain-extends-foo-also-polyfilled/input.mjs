// `class Foo extends Map` chain - Foo extends a polyfillable global (Map), then Bar
// extends Foo. Bar's `super.method()` should resolve through Foo's chain, not blindly
// polyfill `Map.method()`. recursion safety: super chain must not loop on user-class
// inheriting from a polyfilled root.
class Foo extends Map {
  doIt() { return super.entries(); }
}
class Bar extends Foo {
  go() { return super.doIt(); }
}
