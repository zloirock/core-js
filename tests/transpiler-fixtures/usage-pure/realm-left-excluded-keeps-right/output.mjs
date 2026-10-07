import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A realm read of a global the build is told not to substitute decides nothing: a member read over it takes
// the right's static through the identity guard. A bare name an engine lacks throws before the right could
// run, so the read over it keeps the left's own static, native as the build leaves it.
const list = [1, 2];
export const viaRealm = (_ref = _globalThis.Iterator || Array, _ref === Array ? _Array$from(list) : _ref.from(list));
export const viaBare = Iterator.of(list);