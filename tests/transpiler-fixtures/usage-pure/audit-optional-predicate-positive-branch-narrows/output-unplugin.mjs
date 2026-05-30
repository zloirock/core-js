import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// An optional-chained predicate is still trusted in the POSITIVE (truthy) branch: a truthy
// result means the call actually ran and `x is string` held. So inside the if body input is
// string and .at emits ONLY the string arm. This proves the optional-chain gate suppresses
// only the complement direction, not the positive one.
declare const obj: { isStr?(x: unknown): x is string };
declare const input: string | number[];

function f() {
  if (obj.isStr?.(input)) {
    _atMaybeString(input).call(input, 0);
  }
}