import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2;
// Each computed key precedes its read; an extracted default runs before the next key.
// The receiver is evaluated once, and native residual properties keep source order.
const before = 0,
  _ref = source(),
  method = null == _ref ? _ref[""] : (first(), (_ref2 = _at(_ref)) === void 0 ? fallback() : _ref2),
  contains = null == _ref ? _ref[""] : (second(method), _includes(_ref)),
  {
    length
  } = _ref,
  after = 1;
export { before, method, contains, length, after };