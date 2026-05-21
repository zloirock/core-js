import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// `(K) extends ('a') ? Method : Property` in `as`-rename mapped clause - oxc preserves
// outer TSParenthesizedType on both checkType and extendsType slots. without peel, the
// conditional walker bails through the leading typeReference check (K wrapped in
// TSParenthesizedType is not a bare TSTypeReference), dropping every key from the
// mapped expansion. parallel coverage to direct `K extends 'a' ? ...` so future drift
// in oxc's createParenthesizedTypes default doesn't silently regress the rename pipeline
type Pick<T, U extends T> = U;
type Wrapped<T> = { [K in keyof T as (K) extends ('a') ? K : never]: T[K] };
declare const w: Wrapped<{ a: string; b: number }>;
_atMaybeString(_ref = w.a).call(_ref, 0);