import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// the consumers that always kept the probe - one per shape family. `prototypeRead` is the one
// that routes through the kept-nav render rather than the erase: a claim sitting BELOW the chain
// end belongs to the erase channel, which swaps it and re-emits the read, where the nav render
// would spell the guard and leave `Map` native - the realm's prototype, not the ponyfill's
export const prototypeRead = ((null == _globalThis.window ? void 0 : _self).Map, _Map).prototype;