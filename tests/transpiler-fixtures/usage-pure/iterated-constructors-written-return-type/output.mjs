import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map";
var _ref;
// A patched static may return another family; its result needs the matching instance method.
for (const c of [Array, _Map]) c.from = () => "ab";
export const result = _at(_ref = Array.from([])).call(_ref, -1);