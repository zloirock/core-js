import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// `(K) extends ('a') ? Method : Property` in an `as`-rename mapped clause - oxc keeps the
// outer TSParenthesizedType on both the checkType and extendsType slots. without peeling, the
// leading TSTypeReference check fails (wrapped K is not bare) and the conditional bails,
// dropping every key. parallel to direct `K extends 'a' ? ...` so paren-preservation can't regress.
type Pick<T, U extends T> = U;
type Wrapped<T> = { [K in keyof T as (K) extends ('a') ? K : never]: T[K] };
declare const w: Wrapped<{ a: string; b: number }>;
_atMaybeString(_ref = w.a).call(_ref, 0);