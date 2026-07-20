import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
// kept-assign / reused-guard roots with a nested instance-GET: the guard, the composition and the
// resolution degree all agree - the memo's registered write re-types the tail on both emitters,
// so typed dispatch survives the capture (only a primitive value-read widens to the common
// helper), claimable statics read through the ponyfill INSIDE the guard (a raw read would miss
// the polyfill exactly where the target engine lacks the native), a non-claimable nav drops its
// redundant hops, and a claim through the kept assignment spells the ponyfill sequence when the
// root is non-optional or its value nav resolves
let n;
let t;
let c;
let s;
let m;
let g;
let f;
export const keptProto = null == (_ref = n = _globalThis.window) ? void 0 : _nameMaybeFunction(_atMaybeArray(_ref.Array.prototype));
export const iifeStatic = null == (_ref2 = (() => _globalThis)()) ? void 0 : _at(_ref3 = _nameMaybeFunction(_Set)).call(_ref3, 0);
export const keptTriple = null == (_ref4 = t = _globalThis.window) ? void 0 : _at(_ref5 = _nameMaybeFunction(_atMaybeArray(_ref4.Array.prototype))).call(_ref5, 0);
export const keptCallTail = null == (_ref6 = c = _globalThis.window) ? void 0 : _at(_ref7 = _Array$from([2])).call(_ref7, 0);
export const keptCtorLeaf = null == (_ref8 = s = _globalThis.window) ? void 0 : _includes(_ref9 = _nameMaybeFunction(_Set)).call(_ref9, 'S');
export const keptNonOptional = _nameMaybeFunction((m = _globalThis.window, _Map));
export const keptResolvable = _nameMaybeFunction((g = _globalThis, _Set));
export const keptResolvableCall = _at(_ref10 = (f = _globalThis, _Array$from)([3])).call(_ref10, -1);