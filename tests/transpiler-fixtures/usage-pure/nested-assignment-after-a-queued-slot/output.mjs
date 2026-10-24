import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// An earlier flat slot is queued before a later nested receiver capture.
// The exported setter keeps the source binding open; both targets are written once.
let source;
export function setSource(value) {
  source = value;
}
setSource({
  keys: undefined,
  data: [1]
});
let keys, at;
const _ref = source;
keys = _keys(_ref);
at = _at(_ref.data);
export const result = [keys, at.call([4], 0)];