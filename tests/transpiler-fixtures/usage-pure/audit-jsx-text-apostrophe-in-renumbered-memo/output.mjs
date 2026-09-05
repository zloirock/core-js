import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12;
// JSX text holding an apostrophe (or a lone backtick) lands inside a memo the final renumber
// renames: every occurrence must rename together - a renamer that misreads the JSX text as a
// string opener hides every ref after it, keeping the old name while its twin was renamed, so
// the output referenced a ref no declaration printed. the root memo here is dead after the
// rewrite, which is what makes the surviving refs renumber at all
let w;
export const apostrophe = null == (_ref = null == (w = _globalThis.window) ? void 0 : _flatMaybeArray(_ref2 = _Array$of(<li>Don't</li>))?.call(_ref2)) || null == (_ref3 = _mapMaybeArray(_ref)) ? void 0 : _atMaybeArray(_ref4 = _ref3.call(_ref, x => x))?.call(_ref4, 0);
export const backtick = null == (_ref5 = null == (w = _globalThis.window) ? void 0 : _flatMaybeArray(_ref6 = _Array$of(<code>`npm i`</code>))?.call(_ref6)) || null == (_ref7 = _mapMaybeArray(_ref5)) ? void 0 : _atMaybeArray(_ref8 = _ref7.call(_ref5, x => x))?.call(_ref8, 0);
export const attribute = null == (_ref9 = null == (w = _globalThis.window) ? void 0 : _flatMaybeArray(_ref10 = _Array$of(<a title="it's">x</a>))?.call(_ref10)) || null == (_ref11 = _mapMaybeArray(_ref9)) ? void 0 : _atMaybeArray(_ref12 = _ref11.call(_ref9, x => x))?.call(_ref12, 0);