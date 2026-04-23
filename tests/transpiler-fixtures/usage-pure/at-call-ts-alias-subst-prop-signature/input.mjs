// `type Box<V> = { value: V }` + `Box<string[]>.value` - non-index-signature alias member.
// same subst machinery applies: buildSubstMap V -> string[], then substMemberAnnotations
// rewrites `value: V` into `value: string[]`. `.at(-1)` lands on array-specific polyfill
type Box<V> = { value: V };
declare const b: Box<string[]>;
b.value.at(-1);
