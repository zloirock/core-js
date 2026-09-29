import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A capitalised key read off the user's own object is that object's key, not a built-in surface: the
// nested leaf resolves through the object's type as the lowercase spelling and the flat read do, on
// every host, behind an effect or a member, whatever the key spells. Off the realm, a key naming a
// built-in keeps its own route.
const box = {
  Data: [1, 2],
  Text: 'ab',
  Object: [3],
  Inner: {
    List: [4]
  }
};
export const arrayAt = _atMaybeArray(box.Data);
export const stringAt = _atMaybeString(box.Text);
export const keys = _keysMaybeArray(box.Object);
export const deepAt = _atMaybeArray(box.Inner.List);
let assignedAt;
assignedAt = _atMaybeArray(box.Data);
const loopBox = {
  Text: 'cd'
};
for (const _ref of [loopBox]) {
  const loopAt = _atMaybeString(_ref.Text);
  loopAt;
}
export const prefixedFlat = _flatMaybeArray((log(), box.Data));
const wrap = {
  Box: {
    Text: 'ef'
  }
};
export const memberIncludes = _includesMaybeString(wrap.Box.Text);
export const {
  keys: namespaceKeys
} = _globalThis.Array;
export { assignedAt };