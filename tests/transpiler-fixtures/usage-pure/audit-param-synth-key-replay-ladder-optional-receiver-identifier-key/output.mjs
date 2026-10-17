import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an OPTIONAL receiver may be undefined at runtime - native then throws destructuring it, while a
// synthesized literal is always defined. that throw-semantics divergence bails BOTH key spellings
const optionalReceiverHost = {
  arr: [1, 2]
};
const optionalReceiverIdentifierKey = function (_ref = optionalReceiverHost?.arr) {
  let at = _atMaybeArray(_ref);
  return at;
}();
export { optionalReceiverIdentifierKey };