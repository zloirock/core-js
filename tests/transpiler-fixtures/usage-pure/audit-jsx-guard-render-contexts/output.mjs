import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _self from "@core-js/pure/actual/self";
var _ref;
// the guard render inside JSX: a child container, an attribute value and a spread are ordinary
// expression slots, so the fold rides them unchanged - and the reprint has to spell the slot
// back inside a brace, where its tokens sit next to JSX syntax rather than JS
const jsxHost = _globalThis.jsxHost;
export const child = <div>{null == _globalThis.window ? void 0 : _self.jsxHost.count}</div>;
export const attr = <div x={null == _globalThis.window ? void 0 : _self.jsxHost.count} />;
export const spread = <div {...null == _globalThis.window ? void 0 : _self.jsxHost.inner} />;
export const claimChild = <div>{null == _globalThis.window ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0)}</div>;
export { jsxHost };

// an OPERAND slot inside a brace parenthesizes the fold exactly as it would outside one
const jr = () => _globalThis;
export const attrOperand = <div x={-(null == jr().window ? void 0 : _self.jsxHost.inner.count)} />;
export const childTernary = <div>{(null == _globalThis.window ? void 0 : _self.jsxHost.count) > 1 ? null == _globalThis.window ? void 0 : _Math$sign(-2) : 0}</div>;
export const attrTemplate = <div x={`v${null == _globalThis.window ? void 0 : _Number$parseFloat('1.5')}`} />;