import "core-js/modules/es.object.keys";
// Extracting a static from an array element preserves an earlier sibling initializer effect.
let effects = 0;
function bump() {
  effects += 1;
  return 0;
}
const siblingEffectSurvives = function () {
  const {
    1: {
      keys
    }
  } = [bump(), Object];
  return keys;
}();
export { effects, siblingEffectSurvives };