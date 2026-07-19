import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
// a kept-assign proxy root whose erased optional hops re-hang their guard on the surviving leaf:
// a COMPUTED leaf takes the full `?.[` connector (a bare `?[` does not parse), a dotted leaf takes `?`
let a;
export const viaDoubleHop = (a = _globalThis.window)?.['Array'].prototype.indexOf.call([2], 2);
let b;
export const viaSingleHop = (b = _globalThis.window)?.['Array'].from([3]);
// dotted-leaf control: the bare `?` connector stays correct
let c;
export const viaDottedLeaf = (c = _globalThis.window)?.Array.of(4);
// the dropped hop itself spelled computed: connector spelling follows the LEAF, not the hop
let d;
export const viaComputedHop = (d = _globalThis.window)?.Object.entries('q');
let e;
export const viaBothComputed = (e = _globalThis.window)?.['Object'].values('w');