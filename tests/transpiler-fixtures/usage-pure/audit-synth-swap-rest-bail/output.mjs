import _Array$from from "@core-js/pure/actual/array/from";
function run({
  from = _Array$from,
  ...rest
} = Array) {
  return from([1]);
}
run();