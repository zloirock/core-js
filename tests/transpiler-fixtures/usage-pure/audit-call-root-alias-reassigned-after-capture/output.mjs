import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a call-rooted alias (`const G = mk().Array`) captures the callee's yield when it is declared, so a
// reassignment of the callee AFTER that capture leaves the static live - `from` resolves like the
// identifier-rooted twin below. a reassignment BEFORE the capture dominates the alias: it holds the
// replacement's slot, so nothing resolves for it

let mk = () => _globalThis;
const G = mk().Array;
mk = () => ({});
export const afterCapture = _Array$from('ab');
let mk2 = () => _globalThis;
mk2 = () => ({});
const G2 = mk2().Array;
export const beforeCapture = G2.of(1);
let g = _globalThis;
const G3 = g.Object;
g = {};
export const identifierTwin = _Object$fromEntries([]);