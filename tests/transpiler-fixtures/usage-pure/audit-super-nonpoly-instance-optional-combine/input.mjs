// A NON-poly instance super method (`super.custom`, the parent's own method - no core-js polyfill)
// in an instance method still combines like a poly instance super (`super.flat`): the method-GET
// `super.custom` is memoized and called with `this`, the trailing `.map` / `.at` polys thread on the
// result. the combine must take over ANY instance-context super (poly or not) - the static-context
// check, not the method-name resolution, decides; >=2 trailing polys otherwise crash the standalone
class Wrapped extends Base {
  tail() {
    return super.custom?.().map(x => x).at(-1);
  }
}
