import _at from "@core-js/pure/actual/instance/at";
// An opaque exported pattern consumes its nested slot without keeping a second reader.
// User getters must run once; only the source bindings belong to the export surface.
const source = makeSource();
const _ref = source;
const at = _at(_ref.Array.prototype);
const {
  Object: {
    keys
  }
} = _ref;
const {
  other
} = _ref;
export { at, keys, other };