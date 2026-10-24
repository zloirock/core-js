// Discriminant narrow when TS expression-wrappers (`as` / `!` / `satisfies`) sit on the
// guard's MemberExpression object slot. TSAsExpression / TSNonNullExpression /
// TSSatisfiesExpression must be stripped on both equality sides AND the member-object slot
// (else the path key returns null and the guard never matches). distinct methods per branch
// (.repeat string / .at array / .padEnd string / .includes array) pin emission to narrow.
type Box = { kind: 'a'; v: string } | { kind: 'b'; v: number[] };
function probe(box: Box) {
  if ((box as Box).kind === 'a') {
    // @ts-expect-error a runtime guard narrows the receiver where tsc does not, and the read sees the runtime value
    box.v.repeat(2);
  }
  if ((box as Box).kind === 'b') {
    box.v.at(-1);
  }
  if ((box!).kind === 'a') {
    box.v.padEnd(8, '.');
  }
  if ((box satisfies Box).kind === 'b') {
    // @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
    box.v.includes(2);
  }
}
probe(undefined as any);
