import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// `{ [K in keyof Source]: Source[K] | null }` keeps array shape; the optional chain peels the null branch.
// Per-key narrowing must still pick array polyfills despite the union body.
type Source = {
  items: number[];
  tags: string[];
};
type Wrapped = { [K in keyof Source]: Source[K] | null };
declare const target: Wrapped;
null == (_ref = target.items) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);
null == (_ref2 = target.tags) ? void 0 : _findLastMaybeArray(_ref2).call(_ref2, t => t.length > 1);