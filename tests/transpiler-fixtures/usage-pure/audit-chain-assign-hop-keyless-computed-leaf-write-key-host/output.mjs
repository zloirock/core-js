import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// host positions around the collapsed span: a computed WRITE key and a spread argument both
// consume the collapse in place; a proxy hop in a plain call-argument VALUE slot keeps its
// own leaf-ponyfill canon (the positional fall-through, not the hop exit)
let wa;
const box = {};
box[(wa = _globalThis, _self)[0] ?? 'k'] = 1;
export const writeKeyHost = box;