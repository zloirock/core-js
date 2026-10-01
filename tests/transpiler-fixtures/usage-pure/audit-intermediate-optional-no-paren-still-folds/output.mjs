import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// contrast to the paren-terminated cases: an optional hop in the MIDDLE of a chain with no
// terminating parentheses stays one optional chain. the outer `.includes` is a genuine
// continuation, so a nullish inner result must short-circuit the whole chain to undefined and
// the polyfilled inner and outer calls fold into one short-circuiting chain - proving the
// paren gate stays narrow and does not over-bail on ordinary mid-chain optionals.
const r = null == (_ref = _flatMapMaybeArray(arr)) ? void 0 : _includes(_ref2 = _ref.call(arr, x => x)).call(_ref2, 3);