// A computed-key effect follows an optional instance call on its non-short-circuit path.
// The call uses the receiver selected before method lookup; the effect follows the call result.
a.flat?.()[(eff(), "includes")](2);
// super chain-start: the method-get memoizes `super.list`, the call threads `this`, and the
// outer key effect still follows the receiver memo
class A extends B {
  go() { return super.list?.()[(eff(), "at")](0); }
}
new A();
