import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// nested key-path walk: `({ outer: [f] } = { outer: [{...}] })` exercises both
// findDestructuredKeyPath (outer) and findArrayPatternKeyPath (inner) chained -
// followKeyPathInRhs handles mixed-step key paths uniformly
function take(init: {
  data: string[];
}) {
  var _ref;
  let f = init;
  ({
    outer: [f]
  } = {
    outer: [{
      data: ['x']
    }]
  });
  return _atMaybeArray(_ref = f.data).call(_ref, 0);
}
export { take };