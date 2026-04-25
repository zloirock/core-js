import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `infer U extends Constraint` (TS 4.7+) attaches a constraint to the inferred placeholder;
// pattern-matcher must keep extracting the placeholder name and ignore the constraint
type FirstNumber<T> = T extends [infer U extends number, ...any[]] ? U : never;
declare const f: FirstNumber<[number, string]>;
const arr: number[] = [];
_includesMaybeArray(arr).call(arr, f);