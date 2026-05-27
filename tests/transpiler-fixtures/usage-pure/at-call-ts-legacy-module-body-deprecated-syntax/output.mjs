import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// legacy TS `module N {}` spelling - @babel/parser@7 accepts as a namespace synonym,
// @babel/parser@8 rejects (reserves `module` for external-module declarations with a
// string name). modern equivalent lives in at-call-ts-namespace-body
module N {
  var _ref;
  export const x = _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0);
}