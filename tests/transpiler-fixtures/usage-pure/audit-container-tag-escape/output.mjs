import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a template TAG receives its interpolations like a call receives arguments, so a container in an
// interpolation escapes and its slots stop resolving TO A NAME: the clean twin below still binds
// `Object.keys` by name, while the escaped slot only dispatches on the read the source performs
// itself. isolated in its own fixture: in a shared file a sibling channel can mask this branch,
// and the seed proof needs the branch to carry the bail
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