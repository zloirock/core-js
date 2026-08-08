import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
const from = _Array$from;
const {
  from: _unused,
  ...rest
} = (sideEffect(), _globalThis.Array);
from([1, 2, 3]);
rest;