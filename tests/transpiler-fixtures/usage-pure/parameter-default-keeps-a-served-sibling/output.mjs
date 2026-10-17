import _at from "@core-js/pure/actual/instance/at";
// A prior pure import supplies keys on the receiver default. Its native slot read stays live,
// while the escaping parameter's at dispatches on the actual incoming receiver. Supplied undefined
// properties remain undefined; no leaf fallback is introduced.
import Keys from '@core-js/pure/actual/object/keys';
export function read(_ref = {
  keys: Keys
}) {
  let {
    keys
  } = _ref;
  let at = _at(_ref);
  return [keys, at];
}