import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// Identity rename `as K` is structurally a passthrough but blocks the fast-path because nameType is set.
// Expansion must still produce concrete members so per-field dispatch picks Array vs String narrows.
type IdentityRename<T> = { [K in keyof T as K]: T[K] };
declare const r: IdentityRename<{
  data: number[];
  tag: string;
}>;
_atMaybeArray(_ref = r.data).call(_ref, 0);
_includesMaybeString(_ref2 = r.tag).call(_ref2, 'a');