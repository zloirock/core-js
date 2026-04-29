import _includes from "@core-js/pure/actual/instance/includes";
try {} catch (_ref) {
  var _ref2;
  let includes = (_ref2 = _includes(_ref)) === void 0 ? fb : _ref2;
  let {
    includes: _unused,
    ...rest
  } = _ref;
  includes("x");
  rest.y;
}