import _Object$values from "@core-js/pure/actual/object/values";
// A nested static read retains the effect of an earlier object property initializer.
let effects = 0;
function bump() {
  effects += 1;
  return 0;
}
const objectSiblingEffectSurvives = function () {
  const {
    k: {
      values
    }
  } = {
    x: bump(),
    k: {
      values: _Object$values
    }
  };
  return values;
}();
export { effects, objectSiblingEffectSurvives };