import _at from "@core-js/pure/actual/instance/at";
// Capture a nested receiver before evaluating its computed hop, even for one leaf.
// The receiver runs once; instance leaves beside object rest keep their native boundary.
function read(source, key) {
  const {
      [(key(), 'data')]: _ref
    } = null == source ? source[""] : source,
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