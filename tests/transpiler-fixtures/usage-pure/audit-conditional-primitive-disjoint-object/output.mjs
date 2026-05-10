import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// non-primitive check vs primitive extend: `T extends string ? A : B` with T = number[].
// per TS structural subtyping, object types (Array, Map, Promise, ...) can't extend primitive
// types (string, number, boolean, never, null, ...). pickConditionalBranch has dedicated rule
// `!check.primitive && extend.primitive -> return false` (generic; subsumes the never case).
// without this rule, heterogeneous fold over trueBranch=Promise and falseBranch=Array
// collapses to commonType (Object) and loses narrow Array hint. with the rule: deterministic
// falseBranch pick → resolver walks T = number[] → narrow Array dispatch
type Wrap<T> = T extends string ? Promise<number> : T;
declare const r: Wrap<number[]>;
_atMaybeArray(r).call(r, 0);
_includesMaybeArray(r).call(r, 1);