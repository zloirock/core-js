import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15;
// JSX text holding an apostrophe (or a lone backtick) lands inside a memo the final renumber
// renames: every occurrence must rename together - a renamer that misreads the JSX text as a
// string opener hides every ref after it, keeping the old name while its twin was renamed, so
// the output referenced a ref no declaration printed. the root memo here is dead after the
// rewrite, which is what makes the surviving refs renumber at all
let w;
export const apostrophe = null == (w = _globalThis.window) || null == (_ref = _flatMaybeArray(_ref2 = _Array$of(<li>Don't</li>))) || null == (_ref3 = _mapMaybeArray(_ref4 = _ref.call(_ref2))) ? void 0 : _atMaybeArray(_ref5 = _ref3.call(_ref4, x => x))?.call(_ref5, 0);
export const backtick = null == (w = _globalThis.window) || null == (_ref6 = _flatMaybeArray(_ref7 = _Array$of(<code>`npm i`</code>))) || null == (_ref8 = _mapMaybeArray(_ref9 = _ref6.call(_ref7))) ? void 0 : _atMaybeArray(_ref10 = _ref8.call(_ref9, x => x))?.call(_ref10, 0);
export const attribute = null == (w = _globalThis.window) || null == (_ref11 = _flatMaybeArray(_ref12 = _Array$of(<a title="it's">x</a>))) || null == (_ref13 = _mapMaybeArray(_ref14 = _ref11.call(_ref12))) ? void 0 : _atMaybeArray(_ref15 = _ref13.call(_ref14, x => x))?.call(_ref15, 0);