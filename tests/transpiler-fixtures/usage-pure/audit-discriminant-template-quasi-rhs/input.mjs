// discriminant comparison against a single-quasi template literal: `w.kind ===
// `a``. `resolveComputedKeyName` routes through `singleQuasiString` which
// returns the cooked text for templates with zero interpolations, so the value
// classifies the same as the bare string literal 'a'. without that branch the
// discriminant clause would not extract a value and narrowing would degrade
type Shape = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };
declare const w: Shape;
if (w.kind === `a`) {
  w.data.at(0);
}
