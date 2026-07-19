// a kept-assign proxy root whose erased optional hops re-hang their guard on the surviving leaf:
// a COMPUTED leaf takes the full `?.[` connector (a bare `?[` does not parse), a dotted leaf takes `?`
let a;
export const viaDoubleHop = (a = globalThis.window)?.self?.self['Array'].prototype.indexOf.call([2], 2);
let b;
export const viaSingleHop = (b = globalThis.window)?.self['Array'].from([3]);
// dotted-leaf control: the bare `?` connector stays correct
let c;
export const viaDottedLeaf = (c = globalThis.window)?.self?.self.Array.of(4);
// the dropped hop itself spelled computed: connector spelling follows the LEAF, not the hop
let d;
export const viaComputedHop = (d = globalThis.window)?.['self'].Object.entries('q');
let e;
export const viaBothComputed = (e = globalThis.window)?.['self']['Object'].values('w');
