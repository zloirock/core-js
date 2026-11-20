import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A bodyless declaration evaluates the first default before reading flat.
if (flag) var [_ref,, _ref2] = [source, receiver, tail],
  first = _ref === void 0 ? fallback() : _ref,
  flat = _flatMaybeArray(receiver),
  last = _ref2;
consume(first, flat, last);