// `&&` right-side discriminant narrow: `w.kind === 'a' && w.data.at(0)` lifts the left clause
// of the LogicalExpression to a guard before the right side runs. the test span covers ONLY the
// left clause, so violations inside the right side (after the test) must be caught by the
// between-test-and-use check.
type Shape = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };
declare const w: Shape;
const r = w.kind === 'a' && w.data.at(0);
