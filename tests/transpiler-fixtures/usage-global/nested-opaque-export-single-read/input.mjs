// An opaque exported pattern consumes its nested slot without keeping a second reader.
// User getters must run once; only the source bindings belong to the export surface.
const source = makeSource();
export const { Array: { prototype: { at } }, Object: { keys }, other } = source;
