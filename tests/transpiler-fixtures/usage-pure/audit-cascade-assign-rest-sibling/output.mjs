import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// AssignmentExpression cascade: `({Array: {from}, ...rest} = globalThis);` - rest sibling
// in OUTER pattern triggers cascade path with `_unused` sentinel for the polyfilled key
// to preserve rest exclusion semantics. tests cascade-assignment expression handler with hasRest
let from, rest;
var _unused;
({
  Array: _unused,
  ...rest
} = _globalThis);
from = _Array$from;
export { from, rest };