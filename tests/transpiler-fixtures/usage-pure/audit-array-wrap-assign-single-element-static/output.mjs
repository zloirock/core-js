import _Array$from from "@core-js/pure/actual/array/from";
// A single-element array-wrapper on a destructuring-assignment RHS (`[{ from }] = [Array]`) resolves
// through the wrapper to the static method, matching the declaration-form flatten
let from;
from = _Array$from;
from([1]);