import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11;
// a NON-poly computed inner method-get with a non-identifier key (`arr['a-b']`) forces the
// chain combine (a poly hop follows). the combined emit re-reads the inner member from the
// VERBATIM bracket source, never `arr.a-b` (which reparses as subtraction). a computed key
// whose resolved name IS a bare identifier collapses to the dot form, matching babel
declare const arr: {
  'a-b'?: () => number[][];
  from?: () => number[][];
};
export const bracketed = null == (_ref = arr['a-b']) ? void 0 : _atMaybeArray(_ref2 = _flatMaybeArray(_ref3 = _ref.call(arr)).call(_ref3)).call(_ref2, 0);
export const dotted = null == (_ref4 = arr['from']) ? void 0 : _includesMaybeArray(_ref5 = _ref4.call(arr)).call(_ref5, 1);

// a NUMERIC computed inner (`arr[0]`) has no method name at all, so the inner is non-poly by
// construction. two trailing polys force the combine, which must keep the verbatim numeric
// index - bailing stranded them as overlapping standalone transforms (a composition crash)
declare const nums: {
  0?: () => number[][];
};
export const numeric = null == (_ref6 = nums[0]) ? void 0 : _atMaybeArray(_ref7 = _flatMaybeArray(_ref8 = _ref6.call(nums)).call(_ref8)).call(_ref7, 0);

// a DYNAMIC computed key (`rec[k]`) is likewise non-poly; the combine keeps the verbatim key
declare const rec: Record<string, () => number[][]>;
declare const k: string;
export const dynamic = null == (_ref9 = rec[k]) ? void 0 : _atMaybeArray(_ref10 = _flatMaybeArray(_ref11 = _ref9.call(rec)).call(_ref11)).call(_ref10, 0);