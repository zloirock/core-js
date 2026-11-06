import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
// A local tag can mutate a passed container but a tag without that argument cannot.
// Native slot reads and instance dispatch retain the value actually written by the call.
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
const {
  k: {
    keys
  }
} = cleanBox;
export { values, keys };