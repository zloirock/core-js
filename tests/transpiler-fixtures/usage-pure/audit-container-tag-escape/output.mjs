import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
import _Object$keys from "@core-js/pure/actual/object/keys";
// The local tag receives this own container as its second argument and replaces k with Map.
// The object is truthy, so the old Object candidate and its guard are unreachable after the call.
// Pure keeps the actual slot read and instance dispatch; the clean container still resolves Object.keys.
function tagShape(strings, value) {
  if (value) value.k = _Map;
  return '';
}
const tagBox = {
  k: Object
};
void tagShape`x${tagBox}`;
const values = _values(tagBox.k); // the STRINGS array is no user container, so a tag with no interpolation leaves resolution alone
const cleanBox = {
  k: Object
};
void tagShape`plain`;
const keys = _Object$keys;
export { values, keys };