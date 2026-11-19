import _Array$from from "@core-js/pure/actual/array/from";
// Array-pattern aliases retain the value captured by each declaration.
const [a] = [Array];
const [b] = [a];
const [c] = [b];
_Array$from([3]);