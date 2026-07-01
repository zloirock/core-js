import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// negative test: trueType doesn't reference the captured infer name. `T extends (infer U)[]
// ? string : never` matches the array-infer extends shape but the trueType is `string`,
// not `U` - it's a guard, not an unwrap. the element-of-array unwrap must bail (no element-
// of-array narrow); fold falls through to the conditional-branch selection which picks `string`
// from the union `string | never`, so `.at()` correctly narrows to string-aware dispatch
type IsArray<T> = T extends (infer U)[] ? string : never;
declare const inner: IsArray<number[]>;
_atMaybeString(inner).call(inner, 0);
_includesMaybeString(inner).call(inner, 'a');