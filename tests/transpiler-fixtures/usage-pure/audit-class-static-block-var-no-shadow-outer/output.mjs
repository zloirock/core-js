import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// nested class static block declares `var Array` - lives in static block's own scope,
// not in `outer`'s function-locals. plugin must still polyfill `Array.from` and
// `Array.of` in outer (they reference the global). if `collectFunctionLocals`
// descended into class body, the inner `var Array` would be added to outer's locals
// and falsely shadow the global, suppressing both polyfill imports
function outer() {
  class Inner {
    static {
      var Array;
      Array;
    }
  }
  Inner;
  return [_Array$from([1, 2, 3]), _Array$of(4, 5, 6)];
}
outer();