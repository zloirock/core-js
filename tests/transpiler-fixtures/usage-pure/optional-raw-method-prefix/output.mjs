import _includes from "@core-js/pure/actual/instance/includes";
// The receiver prefix runs once even when the optional raw method is absent.
export function read(receiver, prefix, argument) {
  var _ref, _ref2;
  return null == (_ref = (prefix(), receiver).read) ? void 0 : _includes(_ref2 = _ref.call(receiver, argument())).call(_ref2, 2);
}