import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
// SE-tail receiver: a sequence wraps a multi-hop proxy nav ending in a NON-pure static ctor
// (`(eff(), globalThis.self.Array)`), with a further member read outside the sequence. drop the
// redundant proxy hops, keep the static off the pure global, harvest the prefix effect ahead of it -
// the leaf was left raw `globalThis` (ie:11 ReferenceError) off-engine while babel collapsed the chain
let a = 0;
let b = 0;
export const flattened = _flatMaybeArray((a++, _globalThis.Array).prototype).call([1, [2]], 1);
export const mapped = _flatMapMaybeArray((b++, _globalThis.Array).prototype).call([1, 2], n => [n]);