import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// The surviving claim and raw sibling read one guarded constructor value.
let saved;
const _ref = (saved = null == _globalThis.window ? void 0 : _self, saved === _globalThis ? _Map : saved.Map);
const name = _nameMaybeFunction(_ref);
const {
  prototype
} = _ref;
export {};