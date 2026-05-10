import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `T extends never ? A : B` - never is the bottom type per TS spec; nothing extends it
// (except never itself). pickConditionalBranch's generic Object-vs-primitive rule
// `!check.primitive && extend.primitive -> return false` covers this: never is primitive,
// Array (T = number[]) is non-primitive, conditional picks falseBranch deterministically.
// without the rule, heterogeneous fold over Promise vs Array branches would collapse to
// commonType (Object) and lose the Array hint. with rule: walks falseBranch = T = number[]
type Wrap<T> = T extends never ? Promise<unknown> : T;
declare const r: Wrap<number[]>;
_atMaybeArray(r).call(r, 0);
_includesMaybeArray(r).call(r, 1);