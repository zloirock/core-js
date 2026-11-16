import _Array$from from "@core-js/pure/actual/array/from";
// A later store cannot change an already captured alias.
let first;
[first] = [Array];
const [held] = [first];
[first] = [Object];
_Array$from([3]);