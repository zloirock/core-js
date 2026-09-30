import _Object$entries from "@core-js/pure/actual/object/entries";
// A nested array static read preserves the effect in an earlier inner-array element.
let nestedSlotEffects = 0;
const nestedSeSlotKeepsEffect = function () {
  const entries = (nestedSlotEffects += 1, 0, _Object$entries);
  return entries;
}();
export { nestedSlotEffects, nestedSeSlotKeepsEffect };