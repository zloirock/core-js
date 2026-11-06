// a `declare class` getter (bodyless, like the abstract form) yields its declared return type on
// property access, so `b.data.at()` keeps the array polyfill instead of being suppressed as a
// Function-typed member.
declare class B {
  get data(): number[];
}
function f(b: B) {
  return b.data.at(0);
}
