import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `T extends [] ? trueBranch : falseBranch` - empty tuple as extendsType. tupleAsArrayType
// collapses `[]` to $Object('Array', null) inner-less; same constructor as check side
// (`[number, number]` collapses to $Object('Array', number)). typesEqual matches, but
// innersEqual(number, null) fails. pickConditionalBranch's refined inner-less branch:
// when extendIsUnconstrained=false (concrete empty AST, not bare TSTypeReference shorthand),
// any non-null check inner makes the conditional structurally disjoint → return false.
// without refinement: returns null → heterogeneous fold over Promise vs Array branches
// collapses to commonType (Object), narrow Array hint lost. with refinement: deterministic
// falseBranch pick → T = number[] (tuple-like) → narrow Array dispatch
type Wrap<T> = T extends [] ? Promise<number> : T;
declare const r: Wrap<[number, number]>;
_atMaybeArray(r).call(r, 0);
_includesMaybeArray(r).call(r, 1);