import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _toExponentialMaybeNumber from "@core-js/pure/actual/number/instance/to-exponential";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
import _repeatMaybeString from "@core-js/pure/actual/string/instance/repeat";
import _startsWithMaybeString from "@core-js/pure/actual/string/instance/starts-with";
import _trimEndMaybeString from "@core-js/pure/actual/string/instance/trim-end";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
// A claim whose receiver wears `!` inside an open optional chain is guarded at the chain's top: the
// assertion ends nothing, so every plain link after the claim - a deleted member included - rides
// the guard's alternate. An optional link re-guards the result outside, and parens or a cast seal.
declare const nums: number[] | null;
declare const strs: string[] | null;
nums == null ? void 0 : _toFixedMaybeNumber(_ref = _atMaybeArray(nums).call(nums, -1)!).call(_ref, 2).toString();
nums == null ? void 0 : _toExponentialMaybeNumber(_ref2 = _findLastIndexMaybeArray(nums).call(nums, Boolean)!!).call(_ref2, 1).length;
strs == null ? void 0 : _padStartMaybeString(_ref3 = strs.toString()!).call(_ref3, 4)[0];
strs == null ? void 0 : _repeatMaybeString(_ref4 = _trimEndMaybeString(_ref5 = _joinMaybeArray(strs).call(strs, "")!).call(_ref5)).call(_ref4, 2).toUpperCase();
// @ts-expect-error the member read is the probe, and the right answer is a type without it
strs == null ? true : delete _padEndMaybeString(_ref6 = strs.reduce((p, n) => p + n)!).call(_ref6, 4).k;
(strs == null ? void 0 : _startsWithMaybeString(_ref7 = strs.reduceRight((p, n) => p + n)!).call(_ref7, "a"))?.valueOf();
_endsWithMaybeString(_ref8 = (strs == null ? void 0 : _findMaybeArray(strs).call(strs, Boolean))!).call(_ref8, "b").valueOf();
_includesMaybeString(_ref9 = (strs == null ? void 0 : _findLastMaybeArray(strs).call(strs, Boolean)) as string).call(_ref9, "c").valueOf();