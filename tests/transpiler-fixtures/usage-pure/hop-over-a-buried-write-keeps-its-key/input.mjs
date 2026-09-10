// A pristine realm hop with an SE-bearing computed key, read off a value a write anchors. The SE-key
// fold runs only where a root ANCHORS it - the write the `?.` tests, a write target, a root this
// build cannot spell - and a write buried under the hop is none of those, so the hop keeps its key
// and the leaf is read through the realm's own `self`. That is a fold this plan could take and the
// unplugin spine could not (it wants a POSSIBLE-GLOBAL identifier where the memo now stands), so the
// admission stays where both legs agree. The last row is the negative: no write at all keeps it too.
let c = 0;

let buried;
export const writeBuriedUnderTheHop = (buried = globalThis).window?.[(c++, 'self')].Array.name;

let atProbe;
export const writeAtTheProbe = (atProbe = globalThis.window)?.[(c++, 'self')].Object.keys({});

export const noWriteAtAll = globalThis.window?.[(c++, 'self')].Number.isInteger(1);

export { c };
