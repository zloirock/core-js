import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a PARENTHESIZED optional call feeding an instance dispatch: the parens end the chain, so the
// dispatch reads off the guard's value and the receiver has to be memoized around it. native THROWS
// on a nullish there, so the guard stays INSIDE the helper argument and the helper throws on the
// short-circuited void 0 exactly like native - the same rule the destructure-extraction guards
// follow. lifting the test over the helper would be a second spelling of one canon, so both
// emitters keep this one
const arr = [3, [1, 2]];
export const parenOptCallRecv = _flatMaybeArray(_ref = arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)).call(_ref);
// a MEMBER receiver under the same parens needs no memo, so the guard has nowhere to migrate
export const parenOptMemberRecv = (arr == null ? void 0 : _atMaybeArray(arr).call(arr, 0)).toString();
// the same chain WITHOUT the parens keeps its short-circuit, so the whole dispatch rides one guard -
// the control that pins the parens as the cause rather than the optional call
export const unparenOptCallRecv = arr == null ? void 0 : _flatMaybeArray(_ref2 = _concatMaybeArray(arr).call(arr, [4])).call(_ref2);
// the rows that pin the OTHER side of the rule: a LIVE `?.` on the dispatch means native
// short-circuits instead of throwing, and there the test IS hoisted out of the memo - handing
// `void 0` to the helper would throw where the source answers undefined
export const sealedThenOptionalDispatch = null == (_ref3 = arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)) ? void 0 : _flatMaybeArray(_ref3).call(_ref3);
export const sealedThenOptionalCall = null == (_ref4 = arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)) ? void 0 : _atMaybeArray(_ref4)?.call(_ref4, 0);
export const sealedThenCoalesce = (null == (_ref5 = arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)) ? void 0 : _entriesMaybeArray(_ref5).call(_ref5)) ?? 'none';