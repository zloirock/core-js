import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set/constructor";
// A leading unproven global key prevents a mirror just like a trailing one.
// Closed default-only calls allow both statics to extract into the body.
function f({
  [_Set]: y
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, y];
}
f();