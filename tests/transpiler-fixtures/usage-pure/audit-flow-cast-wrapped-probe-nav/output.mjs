import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// a Flow cast is REQUIRED to carry its own parens, so the layer between the probe nav and its tail
// is the cast node itself rather than a paren wrapper - the same absorbed-layer class reached
// through a different node type. the tail keeps the source's PLAIN dereference, which throws where
// the guard answers nullish, and the cast over the LEAF is erased with the node the render replaces
_globalThis.flowBox = {
  list: ['ab', 'cd'],
  n: 7
};
export const castOverNav = null == (_ref = (null == _globalThis.window ? void 0 : _self.flowBox: any).list) ? void 0 : _at(_ref).call(_ref, 0);
export const castOverNavPlain = (null == _globalThis.window ? void 0 : _self.flowBox: any).list;
export const castOverChain = null == (_ref2 = (null == _globalThis.window ? void 0 : _self.flowBox.list: any)) ? void 0 : _at(_ref2).call(_ref2, 0);
export const castOverLeaf = (null == _globalThis.window ? void 0 : _self).flowBox.n;
export const castNested = _atMaybeArray(_ref3 = ((null == _globalThis.window ? void 0 : _self.flowBox: any).list: any[])).call(_ref3, 0);

// the same layer over a CALL and an ASSIGN root: the root effect rides the guard test, and the
// layer must not move where it runs
const cr = () => _globalThis;
let held;
export const castOverCallRoot = null == (_ref4 = (null == cr().window ? void 0 : _self.flowBox: any).list) ? void 0 : _at(_ref4).call(_ref4, 0);
export const castOverAssignRoot = null == (_ref5 = (null == (held = _globalThis).window ? void 0 : _self.flowBox: any).list) ? void 0 : _at(_ref5).call(_ref5, 0);
export { held };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref6 = _atMaybeArray(_ref7 = ['ab', 'cd']).call(_ref7, (null == _globalThis.window ? void 0 : _self.flowBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref6).call(_ref6, 'a');