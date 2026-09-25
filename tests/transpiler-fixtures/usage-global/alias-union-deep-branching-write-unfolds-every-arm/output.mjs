import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/web.dom-collections.entries";
// a deeply nested branching write unfolds to EVERY arm - the union's flattener walks the whole
// expression, no step budget truncates it - so the open arm at the bottom of forty levels keeps
// the instance dispatch beside the static candidate, exactly as a three-level chain does. `Object`
// reads the same name on both arms: `Object.entries` as a static, `entries` on whatever collection
// the open arm holds
let O = Object;
O = c39 ? c38 ? c37 ? c36 ? c35 ? c34 ? c33 ? c32 ? c31 ? c30 ? c29 ? c28 ? c27 ? c26 ? c25 ? c24 ? c23 ? c22 ? c21 ? c20 ? c19 ? c18 ? c17 ? c16 ? c15 ? c14 ? c13 ? c12 ? c11 ? c10 ? c9 ? c8 ? c7 ? c6 ? c5 ? c4 ? c3 ? c2 ? c1 ? c0 ? maybe : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object : Object;
export const a = O.entries(src);