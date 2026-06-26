import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
// SE-tail destructure SOURCE sitting behind a `.prototype` receiver-member read: the sequence wraps a
// multi-hop proxy nav ending in a NON-pure static ctor (`(eff(), globalThis.self.Array).prototype`). the
// destructure path owns the whole SE receiver - collapsing the inner proxy hop in parallel raced its
// replacement and crashed the transform compose. drop the proxy hops, keep the static off the pure global,
// harvest the prefix effect ahead of the receiver
let a = 0;
let b = 0;
export const flat = _flatMaybeArray(((a++, _globalThis.Array).prototype));
export const flatMap = _flatMapMaybeArray(((b++, _globalThis.Array).prototype));