import _globalThis from "@core-js/pure/actual/global-this";
import _Object$values from "@core-js/pure/actual/object/values";
import _self from "@core-js/pure/actual/self";
var _ref;
// ALIAS-rooted probe navs ride the same canon with the alias identifier kept verbatim in
// the guard test; a DEFINED alias nav keeps the hop-drop / ctor-swap collapses
const gAlias = _globalThis;
let cb = 0;
export const viaAliasSealedSeKey = (_ref = (null == gAlias.window ? void 0 : _self).Object, null == _ref ? _ref[""] : (cb++, _Object$values));
export { cb };