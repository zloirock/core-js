import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4;
// what a KEPT WRITE proves about the `?.` sitting on it, asked in the MEMO spelling. a written
// CALL YIELD proves nothing: proving WHICH global a call returns is not proving it returns a
// defined one, so the memo keeps the source `?.` - erasing it turned a short-circuit into a
// throw off-engine. inside a RENDERED hop drop the prefix IS the test's own read, and there the
// proven inline call proves the way a write proves everywhere, so that spelling stays plain.
const ca = () => _globalThis;
const ca2 = () => _globalThis;
let held, heldRoot;
// a written CALL yield keeps its `?.` in the memo
export const writtenCall = null == (_ref = (held = ca())?.window) ? void 0 : _at(_ref2 = _Array$of(1)).call(_ref2, 0);
// inside a RENDERED drop the same written call reads plain: the prefix IS the test
export const renderedDrop = null == (_ref3 = null == (heldRoot = ca2()).window ? void 0 : _self) ? void 0 : _at(_ref4 = _Array$of(3)).call(_ref4, 0);
export { held, heldRoot };