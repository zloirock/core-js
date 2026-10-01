import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
var _ref, _ref2, _ref3;
// the ROOT of a run can itself be absent - an alias holding a probe read, an alias holding a
// rendered guard, a bare probe name - and the `?.` over it tests the root: the hops above fold
// onto the deepest backed span under that one test, whether the read is a static, a value or a
// memoized instance chain. read as a proven realm root, the plan called everything below the leaf
// droppable and the value canon's defined branch called the guard alias always-defined
const probeAlias = _globalThis.window;
export const probeStatic = null == probeAlias ? void 0 : _Array$of(1);
export const probeValue = typeof (null == probeAlias ? void 0 : _self.Array);
export const probeCustom = null == probeAlias ? void 0 : _self.customSlot;
export const probeChain = probeAlias == null ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0);
const guardAlias = null == _globalThis.window ? void 0 : _self;
export const guardStatic = null == guardAlias ? void 0 : _Array$of(1);
export const guardValue = typeof (null == guardAlias ? void 0 : _self.Array);
export const guardSealed = (null == guardAlias ? void 0 : _self).customSlot;
export const guardChain = guardAlias == null ? void 0 : _atMaybeArray(_ref2 = _Array$of(1)).call(_ref2, 0);
export const bareStatic = null == window ? void 0 : _Array$of(1);
export const bareChain = window == null ? void 0 : _atMaybeArray(_ref3 = _Array$of(1)).call(_ref3, 0);

// the instance split over a constructor leaf asks the same value question: a live `?.` over the
// probe-holding root short-circuits with every hop above it backed
export const probeCtorLeaf = probeAlias == null ? void 0 : _nameMaybeFunction(_WeakSet);