import _at from "@core-js/pure/actual/instance/at";
// An optional-chained ASSERTION predicate (`asserts x is string` via `obj.assertStr?.(input)`)
// may short-circuit to undefined WITHOUT running the assertion when the receiver is null/undefined,
// so the code after the statement must NOT trust the asserted type. Same optional-chain gate as the
// user-predicate form, but the assertion only ever narrows forward (the unsound direction), so it
// bails entirely: input stays string | number[] and .at must emit BOTH array and string arms.
declare const obj: { assertStr?(x: unknown): asserts x is string };
declare const input: string | number[];

function f() {
  obj.assertStr?.(input);
  _at(input).call(input, -1);
}