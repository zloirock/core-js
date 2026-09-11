// An optional-chained user-predicate call may short-circuit to undefined (falsy) without
// ever testing its argument, so the complement (else / after-return) branch must NOT trust
// the `x is string` predicate. input stays string | number[] there, so .at must emit BOTH
// array and string arms; trusting the predicate in the negative direction would unsoundly
// drop the string arm.
declare const obj: { isStr?(x: unknown): x is string };
declare const input: string | number[];

function f() {
  if (obj.isStr?.(input)) return;
  input.at(-1);
}
