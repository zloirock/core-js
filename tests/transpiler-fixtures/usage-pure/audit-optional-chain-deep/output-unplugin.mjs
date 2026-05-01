import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Deep optional chain mixing partial `?.` mid-chain.
// receiverType resolution should treat undefined returns from `?.` correctly.
declare const obj: { inner?: { items: string[] } };
null == (_ref = obj?.inner?.items) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);