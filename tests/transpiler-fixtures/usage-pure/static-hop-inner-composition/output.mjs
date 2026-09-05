import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// an instance leaf under a STATIC hop composes off the static's ponyfill - an import binding, always
// defined - so an inner default folds through the static guard and never mirrors a dead branch. the
// constructor may stand behind hops of its own or be the init's own member read, and leaf siblings
// take the flat twin off one memo of that same ponyfill
const viaHop = _nameMaybeFunction(_Array$of === void 0 ? {} : _Array$of);
const viaNoOuterDefault = _nameMaybeFunction(_Array$of === void 0 ? {} : _Array$of);
const viaNoDefault = _nameMaybeFunction(_Array$of);
const viaMemberInit = _nameMaybeFunction(_Array$of === void 0 ? {} : _Array$of);
const viaMemberInitBare = _nameMaybeFunction(_Array$of);
let viaAssign;
viaAssign = _nameMaybeFunction(_Array$of === void 0 ? {} : _Array$of);
const _ref = _Array$of === void 0 ? {} : _Array$of;
const withSibling = _nameMaybeFunction(_ref);
const {
  foo
} = _ref;
const _ref2 = _Array$of;
const hopWithSibling = _nameMaybeFunction(_ref2);
const {
  length
} = _ref2;
export { viaHop, viaNoOuterDefault, viaNoDefault, viaMemberInit, viaMemberInitBare, viaAssign, withSibling, foo, hopWithSibling, length };