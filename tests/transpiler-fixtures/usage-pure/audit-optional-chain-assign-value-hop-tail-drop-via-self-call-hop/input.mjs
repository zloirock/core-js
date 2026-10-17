// a call through the tail keeps its receiver binding and drops the same trailing hop
let w;
export const viaSelfCallHop = (w = globalThis.self)?.self.Array.prototype.includes.call([1, 2], 2);
