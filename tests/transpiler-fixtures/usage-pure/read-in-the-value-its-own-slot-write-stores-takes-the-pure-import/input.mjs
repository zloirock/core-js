// a read of a global in the value its own slot write stores runs before that write, so it takes the
// pure import whichever way the write is spelled - bare or through a realm, a detect or a wrapper - and
// a detect takes it even after an earlier write of the slot, bare or through a realm: core-js wins every
// detect. a read after the write reads the user's slot
Set = Set || ShimSet;
Map = wrap(Map);
globalThis.WeakMap = wrap(WeakMap);
globalThis.Symbol = Symbol || ShimSymbol;
globalThis.Promise = typeof Promise == 'function' ? Promise : ShimPromise;
globalThis.WeakSet = UserWeakSet;
globalThis.WeakSet = WeakSet || ShimWeakSet;
Reflect = UserReflect;
Reflect = Reflect || ShimReflect;
globalThis.URL = UserURL;
URL = URL || ShimURL;
AggregateError = globalThis.AggregateError || ShimAggregateError;
export const later = new WeakMap();
