import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// An opaque exported pattern consumes its nested slot without keeping a second reader.
// User getters must run once; only the source bindings belong to the export surface.
const source = makeSource();
const at = _at(source.Array.prototype);
const keys = _keys(source.Object);
const {
  other
} = source;
export { at, keys, other };