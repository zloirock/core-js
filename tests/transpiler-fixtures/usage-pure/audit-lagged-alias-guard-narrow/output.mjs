import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// guards narrow a LAGGED alias binding (babel rebuilds it after the destructure-assignment
// rewrite): an asserts-predicate statement narrows the reassigned alias to the asserted
// array variant, and a typeof early exit narrows its sibling to the string variant - the
// guard test's scope-host anchor must resolve the same rebuilt binding as the use
declare function assertArr(x: unknown): asserts x is number[];
let F;
F = _Map;
F = _globalThis.data;
assertArr(F);
export const r1 = _includesMaybeArray(F).call(F, 3);
let G;
G = _Map;
G = _globalThis.data;
if (typeof G !== 'string') throw new Error('shape');
export const r2 = _atMaybeString(G).call(G, 0);