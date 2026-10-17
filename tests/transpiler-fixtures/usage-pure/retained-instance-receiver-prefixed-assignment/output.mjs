import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A prefixed assignment captures the nested receiver after the prefix has run.
// The instance dispatch reads that capture once and leaves the assigned value intact.
let prefixes = 0;
const host = {
  m: [1, [2]]
};
let at;
({
  m: _ref
} = (prefixes++, host)), at = _atMaybeArray(_ref);
console.log(at, prefixes);