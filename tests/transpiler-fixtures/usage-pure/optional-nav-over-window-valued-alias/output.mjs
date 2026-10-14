import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// An alias holding the environment probe's value is the probe itself: the realm hops above it read
// self-references of that value, so the one test on the alias covers every optional link up the
// chain - for a read, a `typeof`, a `delete` and a sealed read alike, however the alias was written,
// as it already does under a constructor the chain ends in.
const win = _globalThis.window;
let late;
late = _self.window;
const deep = _self.window;
export const read = null == win ? void 0 : _self.box;
export const kind = typeof (null == deep ? void 0 : _self.flag);
export const removed = null == win ? true : delete _self?.slot;
export const sealed = (null == late ? void 0 : _self).list;
export const built = new (null == deep ? void 0 : _Set)();