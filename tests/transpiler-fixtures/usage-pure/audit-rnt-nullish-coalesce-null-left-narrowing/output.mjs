import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `null ?? "abcdef"` runtime value is always the string - left contributes only when
// non-nullish. resolveUnionType used to call commonType(null-primitive, string), which
// requires equal types and returned null. result type was lost, instance dispatch fell
// back to generic `_at` instead of string-specific `_atMaybeString`. peeling nullable
// left for `??`/`||` recovers the string narrowing
const text = null ?? "abcdef";
_atMaybeString(text).call(text, 0);