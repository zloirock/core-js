import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2;
// trailing OPTIONAL member access after chain emit: `arr.flat?.()?.map(x=>x)` - the `?.`
// after the chain emit's end. `guardNeedsParens` already detects `?.X` follow and triggers
// paren-wrap. asserts both eager `.X` (in chainEmitNeedsWrap) and optional `?.X` (in
// guardNeedsParens) paths agree on wrapping the conditional `cond ? a : b` expression
const arr = [1, 2];
null == (_ref = _flatMaybeArray(arr)) || null == (_ref2 = _ref.call(arr)) ? void 0 : _mapMaybeArray(_ref2).call(_ref2, x => x);