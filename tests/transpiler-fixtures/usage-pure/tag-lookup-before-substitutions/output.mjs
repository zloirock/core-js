import _Array$of from "@core-js/pure/actual/array/of";
// A selected tag reads its receiver and method before the substitutions.
// A non-callable result still evaluates the substitutions before it throws.
export function read(builtin, replacement, observe) {
  var _ref;
  let C = builtin ? Array : replacement;
  return (_ref = C, _ref === Array ? _Array$of : _Array$of.call.bind(_ref.of, _ref))`value${observe(() => {
    C = Array;
  })}`;
}
export function optional(list) {
  return (list?.at)`value`;
}