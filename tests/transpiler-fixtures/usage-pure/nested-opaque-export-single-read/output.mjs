import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// An opaque exported pattern consumes its nested slot without keeping a second reader.
// User getters must run once; only the source bindings belong to the export surface.
const source = makeSource();
const _ref = source;
const at = _at(_ref.Array.prototype);
const keys = _keys(_ref.Object);
const {
  other
} = _ref;
export { at, keys, other };