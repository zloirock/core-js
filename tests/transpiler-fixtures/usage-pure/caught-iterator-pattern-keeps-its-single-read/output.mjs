import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A relocated catch pattern resolves its iterator key in its own scope even when
// the moved pattern has no source offsets. Its nested default precedes the tail,
// and extracting the iterator leaves no second native read as an unused binding.
export function read(input, events) {
  try {
    throw input;
  } catch (_ref) {
    let {
        missing = (_pushMaybeArray(events).call(events, 'default'), 7)
      } = _getIteratorMethod(_ref),
      {
        tail
      } = _ref;
    return [missing, tail];
  }
}