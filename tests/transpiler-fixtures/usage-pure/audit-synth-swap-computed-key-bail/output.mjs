import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Array$from from "@core-js/pure/actual/array/from";
// synthetic argument-receiver substitution must bail when the key is computed and
// non-literal: the rewrite leaves the call site untouched.
function run({
  [_Symbol$iterator]: iter,
  from = _Array$from
} = Array) {
  return from([1, 2, 3]);
}
run();