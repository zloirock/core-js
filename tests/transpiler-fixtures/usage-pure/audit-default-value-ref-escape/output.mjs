import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// `escaped` is referenced as a param-default (`use(s = escaped)`) - a real escaping read, not a binding slot.
// it must keep the anon object from being narrowed (the default-holder may mutate it, so a type-specific Maybe
// helper would throw on a foreign runtime value). babel's referencePaths keeps the ref; the estree walk must
// match - previously it over-excluded the default value as a declaration and narrowed `escaped` (unplugin
// _atMaybeArray vs babel generic). `trusted` has no escaping reference, so it stays narrowed - the contrast
const escaped = {
  items: [1, 2, 3]
};
function use(s = escaped) {
  return s;
}
_at(_ref = escaped.items).call(_ref, -1);
const trusted = {
  items: [4, 5, 6]
};
_atMaybeArray(_ref2 = trusted.items).call(_ref2, 0);