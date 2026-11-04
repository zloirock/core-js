import _atMaybeString from "@core-js/pure/actual/string/instance/at";
export const viaInlineSpreadStringArg = (_ref => {
  let atSpreadStr = _atMaybeString(_ref);
  return atSpreadStr;
})(...["abc"]);