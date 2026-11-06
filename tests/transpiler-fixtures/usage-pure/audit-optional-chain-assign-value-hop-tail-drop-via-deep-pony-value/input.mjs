// a deeper all-ponyfilled navigation as the value: the leaf (`globalThis`) is the spelling
let d;
export const viaDeepPonyValue = (d = globalThis.self.globalThis)?.self.Array.prototype.map.call([1], x => x);
