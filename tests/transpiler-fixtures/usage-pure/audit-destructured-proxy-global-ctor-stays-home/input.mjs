// ... and a destructured constructor that hands nothing out keeps the bare constructor entry: a
// `new` callee and a static read are tracked positions the reaching-value walks resolve through.
// a slot paired with a real container VALUE reads no member of the surface, so its own node carries
// whatever escape it has, a mutated slot keeps reading the user's replacement off the native one,
// and a for-of head under a proxy hop answers the tracked position like every flatter spelling
const { Map } = globalThis;
use(new Map());
const { Set: S } = globalThis;
use(S.name);
const ns = { WeakMap: globalThis.WeakMap };
const { WeakMap: W } = ns;
use(new W());
globalThis.Promise = Shim;
const { Promise: P } = globalThis;
hand(P);
for (const { self: { Iterator: I } } of [globalThis]) use(new I());
