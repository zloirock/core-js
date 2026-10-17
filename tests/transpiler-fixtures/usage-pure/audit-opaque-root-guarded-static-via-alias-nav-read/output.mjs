import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// an ALIAS holding an undefinable nav: the write stores the value canon (the guard
// conditional), the read classifies through its defined branch, keeps its `?.` LIVE (the
// runtime VALUE is the nav's, not the always-defined global the prefix walk sees) and the
// claim composes PLAIN into the single outer test
let navAlias;
navAlias = null == _globalThis.window ? void 0 : _self.window;
export const viaAliasNavRead = navAlias == null ? void 0 : _atMaybeArray(_ref = _Array$of(31)).call(_ref, 0);