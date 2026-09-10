import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a DEAD `?.` names no probe: the value it tests is proven defined, so it is dead text and the run
// renders exactly as its `?.`-less twin does - the nested guard over the run's own UNBACKED hop
// included. read as THE probe, the dead `?.` stood the whole guard render down, and the fold that
// took over dropped the environment read outright: the store then held the ponyfill where its twin
// holds nothing off-engine
let w, t, i, n;
export const deadRootOptional = null == (w = null == _globalThis.window ? void 0 : _self.Array) ? void 0 : _Array$from([1]);
// the `?.`-less TWIN these rows are measured against - a dead `?.` may not change one byte
export const plainTwin = null == (t = null == _globalThis.window ? void 0 : _self.Array) ? void 0 : _Array$from([2]);
// ... and a call root the value canon proves carries the same dead `?.`
const dh = () => _globalThis;
export const deadCallRootOptional = null == (i = null == dh().window ? void 0 : _self.Array) ? void 0 : _Array$from([3]);

// NEGATIVE: a store the `?.` actually TESTS is the plain swap's own shape - the guard erases and the
// write rides ahead of the binding as a comma prefix
export const keptWriteProbe = (n = _globalThis, _self).Array;
export { w, t, i, n };