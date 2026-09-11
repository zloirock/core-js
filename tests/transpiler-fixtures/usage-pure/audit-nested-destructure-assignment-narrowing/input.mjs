// nested key-path walk: `({ outer: [f] } = { outer: [{...}] })` exercises both
// findDestructuredKeyPath (outer) and findArrayPatternKeyPath (inner) chained -
// followKeyPathInRhs handles mixed-step key paths uniformly
function take(init: { data: string[] }) {
  let f = init;
  ({ outer: [f] } = { outer: [{ data: ['x'] }] });
  return f.data.at(0);
}
export { take };
