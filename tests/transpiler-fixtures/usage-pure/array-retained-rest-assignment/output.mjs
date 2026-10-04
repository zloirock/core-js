import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref, _ref2, _unused, _unused2;
// A captured array assignment keeps its stores and static rest exclusions.
// A neighbouring binding follows the nested static; a constructor rest uses its pure source.
let keys, realmRest, saved;
[_ref] = [saved = (effect(), _globalThis)];
_ref.Object, keys = _Object$keys, {
  Object: _unused,
  ...realmRest
} = _ref;
let of, ctorRest, tail;
[, _ref2] = [Array, 7];
of = _Array$of, {
  of: _unused2,
  ...ctorRest
} = Array;
tail = _ref2;
use(keys, realmRest, saved, of, ctorRest, tail);