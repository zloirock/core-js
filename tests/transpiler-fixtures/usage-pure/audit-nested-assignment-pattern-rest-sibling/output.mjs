import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
function run({
  x: {
    from = []
  } = {
    from: _Array$from
  },
  ...rest
} = {}) {
  return [from([1]), rest];
}
function emit({
  y: {
    of = () => null
  } = {
    of: _Array$of
  },
  ...rest
} = {}) {
  return [of(2, 3), rest];
}
export { run, emit };