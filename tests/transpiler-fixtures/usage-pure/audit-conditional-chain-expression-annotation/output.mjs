import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// optional chain on a parenthesised nested-member receiver: `(x?.a)?.b.at(0)`.
// member-annotation walk peels nullable union branches at each chain hop so the
// inner array element type propagates to the outer call site - resolver picks the
// array-specific variant
declare const x: {
  a: {
    b: string[];
  };
} | undefined;
const r = null == (_ref = x?.a) ? void 0 : _atMaybeArray(_ref2 = _ref.b).call(_ref2, 0);
export { r };