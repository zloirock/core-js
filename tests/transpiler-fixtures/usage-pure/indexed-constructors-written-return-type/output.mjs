import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map";
var _ref;
// An indexed constructor selection keeps its patch and the patched return type.
for (var i = 0, items = [Array, _Map]; i < items.length; i++) {
  const c = items[i];
  c.from = () => "ab";
}
export const result = _at(_ref = Array.from([])).call(_ref, -1);