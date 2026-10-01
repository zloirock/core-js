import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _unused;
// A captured array assignment keeps its stores and static rest exclusions.
// A neighbouring binding follows the nested static; a constructor rest uses its pure source.
let keys, realmRest, saved;
[_ref] = _ref2 = [saved = (effect(), _globalThis)], _ref3 = _ref.Object, keys = _Object$keys, _ref3, {
  Object: _unused,
  ...realmRest
} = _ref, _ref, _ref2;
let of, ctorRest, tail;
[_ref4, _ref5] = [Array, 7];
of = _Array$of, {
  of: _ref6,
  ...ctorRest
} = _ref4, _ref4;
tail = _ref5;
use(keys, realmRest, saved, of, ctorRest, tail);