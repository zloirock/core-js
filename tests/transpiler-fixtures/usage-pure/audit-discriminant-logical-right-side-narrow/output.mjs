import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// `&&` right-side discriminant narrow: `w.kind === 'a' && w.data.at(0)` lifts
// the left-side discriminant clause to a guard before evaluating the right side.
// the walker hits LogicalExpression with `current.key === 'right'` and takes
// `test = parent.node.left` - testStart..testEnd covers ONLY the left clause,
// so violations inside the right side (after testEnd) are detected by the
// "between testEnd and use site" branch
type Shape = {
  kind: 'a';
  data: string;
} | {
  kind: 'b';
  data: number[];
};
declare const w: Shape;
const r = w.kind === 'a' && _atMaybeString(_ref = w.data).call(_ref, 0);