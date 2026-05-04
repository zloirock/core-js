import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
const customFrom = _Array$from;
// rename + rest: `const { from: customFrom, ...rest } = Array;`. body-extract emits
// `const customFrom = _Array$from;` + value renamed to `_unused`. receiver narrowing
// resolves through the alias map for the renamed local name. distinct methods per line
const {
  from: _unused,
  ...rest
} = Array;
const xs = customFrom('hi');
_atMaybeArray(xs).call(xs, 0);
_findLastIndexMaybeArray(xs).call(xs, p => p);
_flatMaybeArray(xs).call(xs);