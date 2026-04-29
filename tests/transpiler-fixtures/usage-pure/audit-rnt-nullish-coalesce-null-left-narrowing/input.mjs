// `null ?? "abcdef"` runtime value is always the string - left contributes only when
// non-nullish. resolveUnionType peels the nullable left for `??`/`||` so the result
// narrows to the string type alone, and instance dispatch picks `_atMaybeString` rather
// than the generic `_at` fallback
const text = null ?? "abcdef";
text.at(0);
