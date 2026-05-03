import _at from "@core-js/pure/actual/instance/at";
var _ref;
// matchesConditionalPattern: extends-side is a TSTypeReference (not literal/
// template/string-keyword/union/any/unknown). Returns null - caller bails to
// fallback (no rename narrow). Verifies bail path works (no crash, generic dispatch)
type Mk<T> = { [K in keyof T as K extends Extract<K, keyof T> ? K : never]: T[K] };
declare const r: Mk<{
  items: number[];
}>;
_at(_ref = r.items).call(_ref, 0);