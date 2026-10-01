import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// A caller-supplied receiver keeps its getter between the computed key and the sibling write.
export function read(input, log) {
  var _ref, _ref2, _ref3;
  function mark(tag, value) {
    _pushMaybeArray(log).call(log, tag);
    return value;
  }
  let at, tail;
  [_ref, _ref2] = _ref3 = [mark('receiver', input), 7], null == _ref ? _ref[""] : (mark('key'), at = _at(_ref)), _ref, tail = _ref2, _ref3;
  return [at, tail];
}