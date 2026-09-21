import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// A caller-supplied receiver keeps its getter between the computed key and the sibling write.
export function read(input, log) {
  var _ref, _ref2, _ref4, _ref3;
  function mark(tag, value) {
    _pushMaybeArray(log).call(log, tag);
    return value;
  }
  let at, tail;
  [_ref, _ref2] = _ref3 = [mark('receiver', input), 7], _ref4 = _ref, null == _ref4 ? _ref4[""] : (mark('key'), at = _at(_ref4)), _ref4, tail = _ref2, _ref3;
  return [at, tail];
}