import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a `?.` realm hop reading a SEALED probe run re-tests exactly the value the seal holds, so the run
// goes on through the seal and a `delete` over it takes the guard whole, whatever roots the run.
// a key that is no realm hop reads the sealed value instead and keeps it guarded inside the seal,
// and a plain read past the seal is the source's own throw, a `?.` further on included
let w;
const g = _globalThis;
export const windowTail = null == _globalThis.window ? true : delete _self.window.windowSlot;
export const selfTail = null == _globalThis.window ? true : delete _self.selfSlot;
export const optionalAfterTail = null == _globalThis.window ? true : delete _self.window?.optionalSlot;
export const aliasRoot = null == g.window ? true : delete _self.window.aliasSlot;
export const callRoot = null == (() => _globalThis)().window ? true : delete _self.window.callSlot;
export const storeRoot = delete (w = _globalThis.window)?.storeSlot;
export const plainKey = delete (null == _globalThis.window ? void 0 : _self)?.plainKeySlot;
export const plainRead = delete (null == _globalThis.window ? void 0 : _self).plainReadSlot;
export const plainReadOptionalOn = null == (null == _globalThis.window ? void 0 : _self).window ? true : delete _Array$of(1).optionalOnSlot;