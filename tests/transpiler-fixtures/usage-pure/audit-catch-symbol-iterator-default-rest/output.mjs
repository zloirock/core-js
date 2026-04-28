import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// catch param destructuring with computed Symbol.iterator key carrying a default plus
// a rest gather. exercises both the iterator-method synth path (renamed `_unused`) and
// the AssignmentPattern wrapper - default fallback fires only when extracted value is
// undefined, then the residual destructure leaves rest pointing at the original error
try {} catch (_ref) {
  var _ref2;
  let it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? fallback : _ref2;
  let {
    [_Symbol$iterator]: _unused,
    ...rest
  } = _ref;
  it();
  rest;
}