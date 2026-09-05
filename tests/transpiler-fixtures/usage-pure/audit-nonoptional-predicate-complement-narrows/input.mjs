// Negative: a NON-optional user-predicate call always runs and genuinely tests its argument,
// so the complement (after-return) branch may trust `x is string` and narrow input to the
// remaining number[]. .at then emits ONLY the array arm. This proves the optional-chain gate
// does not over-bail ordinary predicate calls.
declare const obj: { isStr(x: unknown): x is string };
declare const input: string | number[];

function f() {
  if (obj.isStr(input)) return;
  input.at(-1);
}
