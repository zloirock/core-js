import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A TS function can declare a leading `this` pseudo-parameter that fills no runtime arg slot, and
// `Parameters<typeof fn>` drops it at the type level. so the tuple index must skip the `this` slot:
// `Parameters<typeof h>[1]` is `b` (string), `[0]` is `a` (number[]). without the drop the index reads
// one slot early and dispatches the wrong type-specific helper (`_atMaybeArray` on a string -> ie:11
// throw). distinct methods keep each resolution identifiable.
function h(this: Window, a: number[], b: string): void {}
function useB(x: Parameters<typeof h>[1]) {
  return _atMaybeString(x).call(x, 0);
}
function useA(x: Parameters<typeof h>[0]) {
  return _includesMaybeArray(x).call(x, 1);
}
export { useB, useA };