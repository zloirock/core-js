import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// multiple SwitchCases each with a minifier-shape destructure: every case's consequent
// statement list must be visited by the sequence-split pre-pass so the destructure
// emitter can extract the per-case polyfill independently
function dispatch(n) {
  let from, of;
  switch (n) {
    case 1:
      0;
      from = _Array$from;
      return from;
    case 2:
      0;
      of = _Array$of;
      return of;
    default:
      return null;
  }
}
[dispatch(1)([1, 2]), dispatch(2)(3, 4)];