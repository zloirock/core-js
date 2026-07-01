import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `null ?? "abcdef"` runtime value is always the string - left contributes only when
// non-nullish. union-type resolution peels the nullable left for `??`/`||` so the result
// narrows to the string type alone, and instance dispatch picks `_atMaybeString` rather
// than the generic `_at` fallback
const text = null ?? "abcdef";
_atMaybeString(text).call(text, 0);