import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _flagsMaybeRegexp from "@core-js/pure/actual/regexp/instance/flags";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16;
// nested instance dispatch: an inner instance-GET (`.name` / `.flags`) buried in the receiver of an
// outer instance dispatch on a polyfillable-global chain - the outer receiver collapse must stay
// composable with the inner rewrite (this class used to crash the build or silently drop the inner)
export const callOverGet = _at(_ref = _nameMaybeFunction(_globalThis.foo)).call(_ref, 0);
export const plainRoot = _includes(_ref2 = _nameMaybeFunction(_globalThis.bar)).call(_ref2, 'x');
export const ctorRoot = _at(_ref3 = _nameMaybeFunction(_Promise.foo)).call(_ref3, -1);
export const hopRoot = _at(_ref4 = _flagsMaybeRegexp(_globalThis.foo)).call(_ref4, 0);
export const getOverGet = _nameMaybeFunction(_flagsMaybeRegexp(_globalThis.foo));
export const protoChain = _nameMaybeFunction(_atMaybeArray(_globalThis.Array.prototype));
export const wrapped = _nameMaybeFunction(_includesMaybeArray(_globalThis.Array.prototype));
export const doubleNested = _at(_ref5 = _nameMaybeFunction(_flagsMaybeRegexp(_globalThis.foo))).call(_ref5, 0);
export const iifeRoot = null == (_ref6 = (() => _globalThis)()) ? void 0 : _at(_ref7 = _nameMaybeFunction(_ref6.foo)).call(_ref7, 0);
// call-rooted guard memo: the root's inner proxy global substitutes INSIDE the guard text, and a
// claimable static method in the tail keeps its live claim (the root nav resolves through the call)
export const iifeCallTail = null == (_ref8 = (() => _globalThis)()) ? void 0 : _atMaybeArray(_ref9 = _Array$from([1])).call(_ref9, 0);
export const iifeTriple = null == (_ref10 = (() => _globalThis)()) ? void 0 : _at(_ref11 = _nameMaybeFunction(_includesMaybeArray(_ref10.Array.prototype))).call(_ref11, 0);
// optional on a MID hop (root itself not optional): the guard memoizes the chain root and the
// receiver leaf's substitution must survive a reused override to reach the guard text
export const midHopOptional = null == (_ref12 = _globalThis.baz) ? void 0 : _includes(_ref13 = _nameMaybeFunction(_ref12)).call(_ref13, 'z');
// controls: a plain-object receiver and an inner instance-CALL keep their existing shapes
export const objControl = obj == null ? void 0 : _at(_ref14 = _nameMaybeFunction(obj.foo)).call(_ref14, 0);
export const innerCallControl = _includes(_ref15 = _at(_ref16 = _globalThis.foo).call(_ref16, 0)).call(_ref15, 'a');