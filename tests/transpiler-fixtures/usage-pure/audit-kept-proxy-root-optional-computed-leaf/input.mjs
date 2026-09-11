// a kept-assign proxy root whose erased optional hops re-hang their guard on the surviving leaf: an
// INSTANCE dispatch keeps the leaf, so a COMPUTED leaf takes the full `?.[` connector (a bare `?[` does
// not parse); a claimable STATIC re-hangs as a guarded claim instead - both spellings must parse
let a;
export const viaDoubleHop = (a = globalThis.window)?.self?.self['Array'].prototype.indexOf.call([2], 2);
let b;
export const viaSingleHop = (b = globalThis.window)?.self['Array'].from([3]);
// dotted-leaf control - the claim is connector-independent
let c;
export const viaDottedLeaf = (c = globalThis.window)?.self?.self.Array.of(4);
// the dropped hop itself spelled computed - the claim swallows either spelling
let d;
export const viaComputedHop = (d = globalThis.window)?.['self'].Object.entries('q');
let e;
export const viaBothComputed = (e = globalThis.window)?.['self']['Object'].values('w');
