// a LabeledStatement-wrapped preceding-exit if (`outer: if (kind !== 'a') return;`) must be
// peeled to its inner IfStatement before the exit condition is harvested, so the discriminant
// guard survives. post-peel narrow at `f.data.at(0)` knows `f.kind === 'a'`, so the receiver is
// string and `_atMaybeString` emits; without the peel the narrow drops and generic `_at` fires.
type Shape = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };
function run(f: Shape) {
  outer: if (f.kind !== 'a') return;
  f.data.at(0);
}
run({ kind: 'a', data: 'hi' });
