import _Object$keys from "@core-js/pure/actual/object/keys";
// Extracting a static from an array element preserves an earlier sibling initializer effect.
let effects = 0;
function bump() {
  effects += 1;
  return 0;
}
const siblingEffectSurvives = function () {
  const keys = (bump(), _Object$keys);
  return keys;
}();
export { effects, siblingEffectSurvives };