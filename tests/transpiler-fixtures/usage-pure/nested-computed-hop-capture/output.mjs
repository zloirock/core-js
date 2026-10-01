import _at from "@core-js/pure/actual/instance/at";
// Capture a nested receiver before evaluating its computed hop, even for one leaf.
// The receiver runs once; instance leaves beside object rest keep their native boundary.
function read(source, key) {
  const _ref2 = source,
    {
      [(key(), 'data')]: _ref
    } = null == _ref2 ? _ref2[""] : _ref2,
    at = _at(_ref);
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