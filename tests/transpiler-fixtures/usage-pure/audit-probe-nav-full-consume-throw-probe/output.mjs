import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _self from "@core-js/pure/actual/self";
// a full-consume extraction discards the read the source performs, so an UNDEFINABLE probe nav as
// its init re-emits that read as a THROW probe off the guard value: the single-property extraction
// throws exactly where native does. a member read, an object read and an array pattern over the same
// nav keep their guards.
export const trunc = ((null == _globalThis.window ? void 0 : Math).trunc, _Math$trunc);
export const signRead = null == _globalThis.window ? void 0 : _Math$sign;
export const mathRead = null == _globalThis.window ? void 0 : _self.Math;
export const [firstOf] = null == _globalThis.window ? void 0 : _Array$of(1);