import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// the receiver typing follows the argument's family; nested IIFEs register independently
export const viaStringArg = ((_ref, _unused = void 0) => {
  let atStr = _atMaybeString(_ref);
  return atStr;
})("abc");