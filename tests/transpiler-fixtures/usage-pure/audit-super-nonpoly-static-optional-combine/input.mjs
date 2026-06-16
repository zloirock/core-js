// A NON-poly static-context super method (`super.custom`, the parent class's OWN static - no
// core-js polyfill) with >=2 trailing instance polys must COMBINE into one guard like an instance
// super (memoize the method-GET, call with `this`), not bail to overlapping standalone transforms.
// only a super resolving to a polyfillable inherited STATIC (`super.of` / `super.from`) deoptimizes
// via the standalone; a non-poly static super has no deopt, so the coarse "any static-context super
// bails" gate left the trailing chain as overlapping standalones and crashed in compose
class B {
  static custom() {
    return [];
  }
}
class C extends B {
  static build() {
    return super.custom?.().map(x => x).at(-1);
  }
}
export { C };
