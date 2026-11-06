// a deferred-SE destructure host (a `({ hop: { leaf } } = root)` assignment buried in a consumed
// init's sequence prefix) must re-anchor exactly like the plain statement form even though no
// leaf resolves: each emitter re-enters the anchored-plan trigger on its own re-traversal.
let customY;
export const { of } = (({ Map: { customY } } = globalThis), Array);
