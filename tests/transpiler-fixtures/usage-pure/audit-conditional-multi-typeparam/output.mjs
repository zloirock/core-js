import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// conditional type alias with two explicit type-params: `T extends U[] ? U : T`. when
// the call binds T and U so that the check side resolves to the extends side
// (`string[] extends string[]`), the conditional should pick its true-branch (U)
// unambiguously instead of widening across both branches
type ElementOf<T, U> = T extends U[] ? U : T;
declare function probe<T, U>(arr: T): ElementOf<T, U>;
const result = probe<string[], string>(null!);
_atMaybeString(result).call(result, 0);