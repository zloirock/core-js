import _Array$from from "@core-js/pure/actual/array/from";
// body-extract fallback path triggered by a rest sibling with a default-value on the
// polyfilled prop: `{from = [], ...rest} = Array`. body-extract emits `let from = _polyfill;`
// at function body top, but the original `= []` user default becomes dead code (polyfill is
// always defined). caller-passed `{from: customFrom}` is also lost - this is the trade-off
// documented for the body-extract path
function run({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  return [from, rest];
}
run();