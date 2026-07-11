// computed-key outer WITH a side effect on a single-optional inner: the receiver is bound
// (`_ref.call(a)`) AND the effect folds into the combine's alternate (fires only on the
// non-short-circuit path). exercises receiver-preservation and SE-folding together in one combine
a.flat?.()[(eff(), "includes")](2);
// super chain-start: the method-get memoizes `super.list`, the call threads `this`, and the
// outer key effect still follows the receiver memo
class A extends B {
  go() { return super.list?.()[(eff(), "at")](0); }
}
new A();
