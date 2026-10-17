// Negative: a NON-optional assertion call always runs, so the code after it may trust
// `asserts x is string` and narrow input to string. .at then emits ONLY the string arm.
// This proves the optional-chain gate on the assertion path is scoped to the optional form
// and does not over-bail ordinary assertion statements.
declare const obj: { assertStr(x: unknown): asserts x is string };
declare const input: string | number[];

function f() {
  obj.assertStr(input);
  input.at(-1);
}
