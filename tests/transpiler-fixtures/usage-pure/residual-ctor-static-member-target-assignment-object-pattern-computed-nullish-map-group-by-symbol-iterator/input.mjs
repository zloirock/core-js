// ... and a MULTI-hop pattern splits the same way, each hop answering on its own (a well-known-symbol
// leaf reads as the hop's own value)
let gb, it;
({ Map: { groupBy: gb }, Symbol: { [Symbol.iterator]: it } } = globalThis.window ?? globalThis);

export const r = [gb, it];
