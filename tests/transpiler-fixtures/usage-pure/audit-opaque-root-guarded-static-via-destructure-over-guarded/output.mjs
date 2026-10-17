import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a DESTRUCTURE over the guarded static extracts through the instance canon: the helper
// receives the GUARDED value and throws on the short-circuited void 0 exactly like native
// destructuring of undefined (faithful-throw)
const dg = () => _globalThis;
const pickedAt = _atMaybeArray(null == dg().window ? void 0 : _Array$of(9));
export const viaDestructureOverGuarded = pickedAt;