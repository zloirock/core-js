// discriminated union narrowing through optional-chain access `s?.kind`. pathKey now
// serialises OptionalMemberExpression identically to MemberExpression ('s.kind'), so guard
// LHS matches `s.data` in the body. branch `{kind: 'a'; data: number[]}` wins, `.at(0)`
// dispatches to the array-specific polyfill
type Shape = { kind: 'a'; data: number[] } | { kind: 'b'; data: string };
declare const s: Shape;
if (s?.kind === 'a') {
  s.data.at(0);
}
