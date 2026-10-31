import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a selection the build decides yields its live operand alone, so a key instances carry too reads the
// static off it: the dead arm of a ternary and the left of an `&&` name no guard candidate - declared,
// assigned, and as a parameter default
export const entries = _Object$entries;
let values;
values = _Object$values;
export { values };
export const concat = _Iterator$concat;
let keys;
keys = _Object$keys;
export { keys };
export function viaParam({
  values: read
} = {
  values: _Object$values
}) {
  return read;
}