import _at from "@core-js/pure/actual/instance/at";
// Optional chaining on BOTH the receiver and the call (`obj?.isStr?.(input)`) can short-circuit
// to undefined without ever testing input, so the complement (after-return) branch must NOT trust
// the `x is string` predicate. input stays string | number[] there, so .at must emit BOTH array
// and string arms. This confirms the optional gate detects the chain even when the receiver itself
// is optional, not only the trailing call.
declare const obj: {
  isStr?(x: unknown): x is string;
} | undefined;
declare const input: string | number[];
function f() {
  if (obj?.isStr?.(input)) return;
  _at(input).call(input, -1);
}