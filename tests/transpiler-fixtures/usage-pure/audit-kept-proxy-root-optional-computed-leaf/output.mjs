import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
// a kept-assign proxy root whose erased optional hops re-hang their guard on the surviving leaf: an
// INSTANCE dispatch keeps the leaf, so a COMPUTED leaf takes the full `?.[` connector (a bare `?[` does
// not parse); a claimable STATIC re-hangs as a guarded claim instead - both spellings must parse
let a;
export const viaDoubleHop = (a = _globalThis.window)?.['Array'].prototype.indexOf.call([2], 2);
let b;
export const viaSingleHop = null == (b = _globalThis.window) ? void 0 : _Array$from([3]);
// dotted-leaf control - the claim is connector-independent
let c;
export const viaDottedLeaf = null == (c = _globalThis.window) ? void 0 : _Array$of(4);
// the dropped hop itself spelled computed - the claim swallows either spelling
let d;
export const viaComputedHop = null == (d = _globalThis.window) ? void 0 : _Object$entries('q');
let e;
export const viaBothComputed = null == (e = _globalThis.window) ? void 0 : _Object$values('w');