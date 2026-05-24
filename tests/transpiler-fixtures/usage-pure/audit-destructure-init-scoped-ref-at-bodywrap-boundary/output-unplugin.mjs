import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// scopedVar insertPos lands at block.start + 1 (the `var _ref;` anchor immediately after
// `{`). that position is INCLUSIVE in bodyContains() since both bodyWrap's body.start and
// the scopedVar's insertPos can coincide for tight nested-block shapes. pins inclusive
// containment - exclusive `>` would drop the scopedVar at the boundary, leaving _ref
// undeclared after the bodyWrap overwrite
((() => {
var _ref;var x = _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0); return Array;})(), Array);
const from = _Array$from;
console.log(from);