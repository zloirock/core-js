// a nested class static block declares `var Array` - it lives in the static block's own
// scope, not `outer`'s function-locals, so `Array.from` / `Array.of` in outer still reference
// the global and must polyfill. local collection must NOT descend into the class body, else
// the inner `var Array` joins outer's locals and falsely shadows the global, suppressing both
function outer() {
  class Inner {
    static {
      var Array;
      Array;
    }
  }
  Inner;
  return [
    Array.from([1, 2, 3]),
    Array.of(4, 5, 6),
  ];
}
outer();
