import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a STATIC claim whose value is a pattern with a default binds the pattern off the guarded import
// binding: the static guard tests the always-defined ponyfill in place, on every host and behind a
// proxy hop alike, while a typed instance twin keeps the memoized instance guard. a pattern without a
// default reads the raw slot on both legs - a function destructured as an iterable throws either way
const [viaCtor = ")"] = _Array$of === void 0 ? [] : _Array$of;
const [viaHop] = _Array$of === void 0 ? [] : _Array$of;
const [viaOuterDefault = ")"] = _Array$of === void 0 ? [] : _Array$of;
let viaAssign;
[viaAssign = ")"] = _Array$of === void 0 ? [] : _Array$of;
const {
  foo: viaObjectLeft
} = _Array$of === void 0 ? {} : _Array$of;
const src = [1, [2]];
const [viaInstance = 0] = (_ref = _atMaybeArray(src)) === void 0 ? [] : _ref;
const {
  of: [rawSlot]
} = _globalThis.Array;
export { viaCtor, viaHop, viaOuterDefault, viaAssign, viaObjectLeft, viaInstance, rawSlot };