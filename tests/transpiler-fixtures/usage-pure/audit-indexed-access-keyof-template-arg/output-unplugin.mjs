import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// single-quasi TemplateLiteral arg (`` `a` ``). indexFromArgLiteral's String / Numeric
// `isLiteralOf` checks miss, but `singleQuasiString` returns the cooked text so the
// rewrite still produces `Items['a']` (parity with `indexedAccessKey` on the type side,
// where the same helper recognises ``T[`a`]`` template indexing)
type Items = { a: string[]; b: number[] };
declare function pick<K extends keyof Items>(k: K): Items[K];
_atMaybeArray(_ref = pick(`a`)).call(_ref, 0);