import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _self from "@core-js/pure/actual/self";
// a `?.` over a chain-assign STORE weighs the value the store hands on, not the write: the stored
// navigation can short-circuit, so the destructure init re-emits the read the fold would swallow
// and keeps the source's throw. the PLAIN twin beside it stores the same short-circuiting value and
// re-emits the same read - what its missing `?.` changes is where the throw lands, not whether one
let v, w;
const ga = _globalThis;
const trunc = ((null == (v = null == ga.window ? void 0 : _self) ? void 0 : Math).trunc, _Math$trunc);
const plainTwin = ((w = null == ga.window ? void 0 : _self).window, _Math$trunc);
export { trunc, plainTwin, v, w };