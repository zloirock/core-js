import _Array$from from "@core-js/pure/actual/array/from";
var _unused;
// A rest extraction in a call argument is owned by its local sequence.
let from, rest;
use((from = _Array$from, {
  from: _unused,
  ...rest
} = Array, Array));