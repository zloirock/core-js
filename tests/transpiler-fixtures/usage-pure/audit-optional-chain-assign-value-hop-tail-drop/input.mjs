// a chain-assign optional subject whose VALUE is a global-proxy navigation keeps its guard
// (the value may be undefined off-engine), while the redundant trailing global hop over the
// memoized root is dropped: re-reading the hop off the memo would throw on engines without it
let q;
export const viaSelfHop = (q = globalThis.self)?.self.Array.prototype.flat;

// a call through the guarded tail keeps its receiver binding and drops the same trailing hop
let w;
export const viaSelfCallHop = (w = globalThis.self)?.self.Array.prototype.includes.call([1, 2], 2);
