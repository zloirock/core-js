import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// comma expression in receiver position with sibling rest in outer pattern. cascade
// lifts the side-effect prefix as a separate statement before the destructure so receiver
// collapses to bare polyfilled binding; `_unused` sentinel ensures rest-exclusion semantics;
// separate polyfill assign overrides the captured (potentially buggy native) value
let from, rest;
console.log('se');
var _unused;
({
  Array: _unused,
  ...rest
} = _globalThis);
from = _Array$from;