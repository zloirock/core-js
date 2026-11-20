import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A retained default keeps its native binding position before a sibling extraction.
const [_ref,, _ref2] = [source, receiver, tail],
  first = _ref === void 0 ? fallback() : _ref,
  flat = _flatMaybeArray(receiver),
  last = _ref2,
  extra = 2;
consume(first, flat, last, extra);