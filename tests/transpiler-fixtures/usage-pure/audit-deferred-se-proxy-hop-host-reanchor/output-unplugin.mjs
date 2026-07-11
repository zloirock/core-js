import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a deferred-SE destructure host (a `({ hop: { leaf } } = root)` assignment buried in a consumed
// init's sequence prefix) must re-anchor exactly like the plain statement form even though no
// leaf resolves: the AST emitter re-enters the anchored-plan trigger on its drain re-traversal;
// the text emitter records the lifted operand and composes the anchored rebuild into the lifted
// statement by needle.
let customY;
({ customY } = _Map);
export const of = _Array$of;
// assignment-host consume lifts and re-anchors the same way
let customZ, from1;
({ customZ } = _Map);
from1 = _Array$from;
export { from1 };
// a RESOLVABLE leaf keeps the extraction pipelines' own emit shapes (drain flatten vs
// leaf-driven synth literal) - runtime-equal, locked as the sidecar
let picked;
({ Map: { groupBy: picked } } = { Map: { groupBy: _Map$groupBy } });
export const from = _Array$from;
export { picked };
// an SE inside the host's own RHS keeps the un-anchored emit in BOTH emitters
let customW;
let c = 0;
({ Map: { customW } } = (c++, _globalThis));
export const entries = _Object$entries;
// a FOR-INIT consumed prefix re-embeds into the sink and stays un-anchored in BOTH emitters
// (the drain never reaches the sink clone)
let customV, out;
for (const _ref = (({ Map: { customV } } = _globalThis), Object), keys = _Object$keys; !out;) out = keys;
export { out };
// gate boundaries: a MULTI-prop host stays un-anchored (single-hop shape only); a DEEPER nest
// re-anchors one level; a binding-resolved computed key re-anchors like the dotted form
let m1, m2, deep, viaKey;
const hopKey = 'Map';
({ Map: { m1 }, Set: { m2 } } = _globalThis);
export const getOwnPropertyNames = _Object$getOwnPropertyNames;
({ customY: { deep } } = _Map);
export const values = _Object$values;
({ viaKey } = _Map);
export const assign = _Object$assign;