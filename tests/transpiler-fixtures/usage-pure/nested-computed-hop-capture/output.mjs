import _at from "@core-js/pure/actual/instance/at";
// Capture a nested receiver before evaluating its computed hop, even for one leaf.
// The receiver runs once; instance leaves beside object rest keep their native boundary.
function read(source, key) {
  const _ref2 = source,
    {
      [(key(), 'data')]: _ref
    } = null == _ref2 ? _ref2[""] : _ref2,
    _ref3 = _ref,
    at = null == _ref3 ? _ref3[""] : _at(_ref3);
  return at;
}
function readSiblings(source, key) {
  const {
    before,
    [(key(), 'data')]: {
      includes,
      ...rest
    },
    after
  } = source;
  return [before, includes, rest, after];
}