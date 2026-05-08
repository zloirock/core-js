import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// nested proxy-global destructure with RestElement: `const { Array: { from }, ...rest } = globalThis`.
// flatten body-extract emits `const from = _Array$from;` and rewrites outer pattern.
// alias registration through nested-proxy path keeps receiver narrowing intact for the
// extracted `from` binding. distinct methods per line
const from = _Array$from;
const {
  Array: _unused,
  ...rest
} = _globalThis;
const xs = from('hi');
_atMaybeArray(xs).call(xs, 0);
_includesMaybeArray(xs).call(xs, 'h');
_flatMaybeArray(xs).call(xs);