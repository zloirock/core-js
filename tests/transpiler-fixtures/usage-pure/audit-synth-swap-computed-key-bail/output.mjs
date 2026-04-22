import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Array$from from "@core-js/pure/actual/array/from";
function run({
  [_Symbol$iterator]: iter,
  from = _Array$from
} = Array) {
  return from([1, 2, 3]);
}
run();