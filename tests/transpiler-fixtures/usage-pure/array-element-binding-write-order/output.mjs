import _at from "@core-js/pure/actual/instance/at";
// A getter observes preceding array bindings and the uninitialized following binding.
// Neighbouring declarators retain their source evaluation order.
export function read(make) {
  const lead = 1,
    [_ref, _ref2, _ref3] = [2, make(() => [before, after]), 3],
    before = _ref,
    at = _at(_ref2),
    after = _ref3,
    tail = 4;
  return [lead, before, at, after, tail];
}