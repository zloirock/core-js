// A nested array static read preserves the effect in an earlier inner-array element.
let nestedSlotEffects = 0;
const nestedSeSlotKeepsEffect = (function () {
  const { 0: { 1: { entries } } } = [[(nestedSlotEffects += 1, 0), Object]];
  return entries;
})();
export { nestedSlotEffects, nestedSeSlotKeepsEffect };
