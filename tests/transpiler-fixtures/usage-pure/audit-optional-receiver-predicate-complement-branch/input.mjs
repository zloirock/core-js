// Optional chaining on BOTH the receiver and the call (`obj?.isStr?.(input)`) can short-circuit
// to undefined without ever testing input, so the complement (after-return) branch must NOT trust
// the `x is string` predicate. input stays string | number[] there, so .at emits BOTH array and
// string arms - confirming the optional gate detects the chain even when the receiver is optional.
declare const obj: { isStr?(x: unknown): x is string } | undefined;
declare const input: string | number[];

function f() {
  if (obj?.isStr?.(input)) return;
  input.at(-1);
}
