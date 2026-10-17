import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
export const viaNonLiteralSpreadBails = ((_ref, _unused = void 0) => {
  let flatSpread = _flatMaybeArray(_ref);
  return flatSpread;
})(...mkArgs());