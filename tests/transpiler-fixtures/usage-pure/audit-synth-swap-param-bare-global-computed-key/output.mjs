import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set/constructor";
// An unproven global key prevents a parameter mirror. Every call uses the default,
// so the named statics extract into the body while the key stays in the pattern.
function f({
  [_Set]: y
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, y];
}
f();