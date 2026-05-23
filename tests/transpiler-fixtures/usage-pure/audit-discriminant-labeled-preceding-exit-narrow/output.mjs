import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// LabeledStatement-wrapped preceding-exit if (`outer: if (kind !== 'a') return;`)
// must peel to its inner IfStatement before `resolveExitCondition` to harvest the
// discriminant guard. parseSiblingGuards in typeof-guards.js already peels labels
// symmetric; collectPrecedingExitDiscriminants now mirrors via peelLabeledStatementPath.
// post-fix narrow at `f.data.at(0)` knows `f.kind === 'a'` so receiver is string -
// emit _atMaybeString. without the peel the narrow drops and generic _at fires
type Shape = {
  kind: 'a';
  data: string;
} | {
  kind: 'b';
  data: number[];
};
function run(f: Shape) {
  var _ref;
  outer: if (f.kind !== 'a') return;
  _atMaybeString(_ref = f.data).call(_ref, 0);
}
run({
  kind: 'a',
  data: 'hi'
});