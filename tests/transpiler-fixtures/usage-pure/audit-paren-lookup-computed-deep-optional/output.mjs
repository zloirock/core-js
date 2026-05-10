import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// computed key inside optional chain: `(arr?.[k].includes)(1)`. computed access goes
// through the same deopt path as identifier access. memoize the deep receiver so
// `arr[k]` evaluates once even with paren-lookup throw semantics
declare const arr: {
  [key: string]: number[];
} | null;
declare const k: string;
const r = (arr == null ? void 0 : _includesMaybeArray(_ref = arr[k])).call(_ref, 1);