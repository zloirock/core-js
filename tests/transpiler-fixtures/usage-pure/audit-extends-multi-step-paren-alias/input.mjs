// multi-step alias `const B = A; const A = (Promise); class C extends B` - super.try(r)
// inside C must route to the Promise polyfill by walking the alias chain through parens
const A = (Promise);
const B = A;
class C extends B {
  static run(r) { return super.try(r); }
}
