import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// an alias whose init navigates an unbacked hop to a BACKED leaf folds whole to that ponyfill, so
// the binding holds the realm object and a `?.` reading it through a store guards nothing. asked as
// "did the init spell an unbacked hop" the store kept a dead test on one leg only; the differential
// is blind to the whole class - the import sets are identical and only the text differs.
let w, v, u;
const folded = _self;
export const overStore = (w = folded, _Array$of)(1);
// NEGATIVE: an alias of a TERMINAL probe read holds a value that can be absent and keeps its guard
const probe = _self.window;
export const overProbeStore = null == (v = probe) ? void 0 : _Array$of(2);
// NEGATIVE: the same probe named directly, whose raw read the guard test re-emits
export const overDirectStore = null == (u = null == _globalThis.window ? void 0 : _self) ? void 0 : _Array$of(3);