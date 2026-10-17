import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// A kept write stores what it reads, so the realm hop it stores is an observable read even past
// another realm hop: the guard stays on the stored value, and the write keeps that value rather
// than the realm the run would fold to - for a static past more realm hops, a constructor, a
// `typeof` and an aliased or `self` root alike.
let v;
const g = _globalThis;
const l = [1, 2];
export const viaFrom = null == (v = _self.window) ? void 0 : _Array$from(l).length;
export const viaOf = null == (v = _self.window) ? void 0 : _Array$of(1);
export const viaCtor = new (null == (v = _self.window) ? void 0 : _Set)(l);
export const viaAlias = null == (v = _self.window) ? void 0 : _Math$trunc(2.5);
export const viaSelf = null == (v = _self.window) ? void 0 : _Object$entries(l);
export const viaTypeof = typeof (null == (v = _self.window) ? void 0 : _Map);