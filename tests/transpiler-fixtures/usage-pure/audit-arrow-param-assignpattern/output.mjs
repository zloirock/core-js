import _Array$of from "@core-js/pure/actual/array/of";
// arrow function with destructure-with-default param `({ of } = Array)`. plugin rewrites
// the default slot to replace Array.of with the polyfill helper, preserving the arrow's
// single-param signature and default-value semantics
const fn = ({
  of
} = {
  of: _Array$of
}) => of(1);
fn;