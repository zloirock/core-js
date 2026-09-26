// a guard belongs to the ARGUMENT it was built for. lifting it over the call the source wrote turns
// that argument's short-circuit into the whole call's, and the call then never runs where native
// runs it with an undefined argument. only a wrapper the PLUGIN builds around the claim may carry a
// guard outward - it stays undefined-tolerant, and the source's own call does not. the rows walk the
// syntactic contexts because the climb is decided per node, not per file
export const topLevel = Array.of(globalThis.window?.self.Math.trunc(1.5));
export function inFunction() {
  return Array.of(globalThis.window?.self.Math.round(0.4));
}
export const inArrow = () => Array.of(globalThis.window?.self.Number.parseFloat('1.5'));
export function paramDefault(a = Array.of(globalThis.window?.self.Math.sign(-2))) {
  return a;
}
export class Holder {
  field = Array.of(globalThis.window?.self.Math.cbrt(8));
  static stat = Array.of(globalThis.window?.self.Math.fround(1.5));
}
// the same call with the claim NOT alone in the argument list - the control that pins the single
// argument as the climb's trigger rather than the call itself
export const withSibling = Array.of(0, globalThis.window?.self.Math.trunc(2.5));
// a nested nav keeps its own test too: neither guard may swallow the other
export const nestedNav = globalThis.window?.self.Array.of(globalThis.window?.self.Math.expm1(0));
