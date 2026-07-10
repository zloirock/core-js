// a deferred-SE destructure host (a `({ hop: { leaf } } = root)` assignment buried in a consumed
// init's sequence prefix) must re-anchor exactly like the plain statement form even though no
// leaf resolves: the AST emitter re-enters the anchored-plan trigger on its drain re-traversal;
// the text emitter records the lifted operand and composes the anchored rebuild into the lifted
// statement by needle.
let customY;
export const { of } = (({ Map: { customY } } = globalThis), Array);
// assignment-host consume lifts and re-anchors the same way
let customZ, from1;
({ from: from1 } = (({ Map: { customZ } } = globalThis), Array));
export { from1 };
// a RESOLVABLE leaf keeps the extraction pipelines' own emit shapes (drain flatten vs
// leaf-driven synth literal) - runtime-equal, locked as the sidecar
let picked;
export const { from } = (({ Map: { groupBy: picked } } = globalThis), Array);
export { picked };
// an SE inside the host's own RHS keeps the un-anchored emit in BOTH emitters
let customW;
let c = 0;
export const { entries } = (({ Map: { customW } } = (c++, globalThis)), Object);
// a FOR-INIT consumed prefix re-embeds into the sink and stays un-anchored in BOTH emitters
// (the drain never reaches the sink clone)
let customV, out;
for (const { keys } = (({ Map: { customV } } = globalThis), Object); !out;) out = keys;
export { out };
// gate boundaries: a MULTI-prop host stays un-anchored (single-hop shape only); a DEEPER nest
// re-anchors one level; a binding-resolved computed key re-anchors like the dotted form
let m1, m2, deep, viaKey;
const hopKey = 'Map';
export const { getOwnPropertyNames } = (({ Map: { m1 }, Set: { m2 } } = globalThis), Object);
export const { values } = (({ Map: { customY: { deep } } } = globalThis), Object);
export const { assign } = (({ [hopKey]: { viaKey } } = globalThis), Object);
