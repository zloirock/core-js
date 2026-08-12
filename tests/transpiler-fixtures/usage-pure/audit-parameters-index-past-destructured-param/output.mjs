import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `Parameters<typeof fn>[N]` counts SLOTS, so a destructured head still occupies index 0 and the
// tail keeps its index - a signature param that is neutralized for the scope walk must keep its
// place in the list, not be folded away. Head and tail take different families so a slot that
// shifted by one shows up as the wrong receiver rather than as a missing import.
declare function fn({
  a
}: number[], b: string): void;
declare const head: Parameters<typeof fn>[0];
declare const tail: Parameters<typeof fn>[1];
_atMaybeArray(head).call(head, 0);
_includesMaybeString(tail).call(tail, 'x');