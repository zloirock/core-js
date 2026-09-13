import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// Proven call roots and identifier roots use the same realm-run landing.
// Delete-deciding optionals survive, and bound hop keys fold like dotted keys.
// A stored constructor value keeps its store while its redundant optional call guard disappears.
const dh = () => _globalThis;
const bk = 'window';
let w;
let v;
delete _self.window?.a.keptGuardSlot;
delete _globalThis.deadRootOptionalSlot;
delete _globalThis.boundKeyHopSlot;
export const boundHopFolds = _self.a?.readSlot;
export const guardTestFolds = (w = _globalThis.Array, _Array$from)([]);
export const blockBodyRootProbe = (v = _Promise, _Promise$resolve)(1);
export const stored = [typeof w, typeof v];