import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// well-known-symbol access over a KEPT chain-assign root (the stored value navigates an
// unresolvable hop, so the assignment stays the receiver): the harvested receiver SE - a
// sequence prefix around the root, a dropped-hop key effect - must ride ahead of the collapsed
// receiver on BOTH emitters (one used to drop it silently), and a live `?.` keeps its guard
// (the kept value can be absent - the helper would throw where native short-circuits)
let a;
export const keptPlain = _getIteratorMethod(a = _globalThis.window);
let b;
let sc = 0;
export const sePrefix = _getIteratorMethod((sc++, b = _globalThis.window));
let c;
export const seInValue = _getIteratorMethod(c = (sc++, _globalThis.window));
let d;
export const seHopKey = _getIteratorMethod((sc++, d = _globalThis.window));
let e;
export const optionalKept = null == (sc++, e = _globalThis.window) ? void 0 : _getIteratorMethod(e);
let f;
export const symbolKeySe = (f = _globalThis.window, sc++, _getIteratorMethod(f));