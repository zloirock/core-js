// A STATIC super method (`super.of` in a static method, resolving to the polyfillable static
// `Array.of`) must be DEOPTIMIZED like the standalone path - the polyfill is always defined, so the
// optional `?.()` drops its guard (`_Array$of.call(this, 1)`, no `null ==` test) and the trailing
// `.map` / `.at` polys combine on the result. distinct from an INSTANCE super method (`super.flat`),
// which stays native and keeps its guard
class Wrapped extends Array {
  static build() {
    return super.of?.(1).map(x => x).at(0);
  }
}
