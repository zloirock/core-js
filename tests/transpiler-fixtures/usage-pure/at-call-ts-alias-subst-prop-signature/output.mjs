import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `type Box<V> = { value: V }` + `Box<string[]>.value` - non-index-signature alias member.
// same substitution machinery applies: type-param substitution V -> string[], then
// member-annotation substitution rewrites `value: V` into `value: string[]`. `.at(-1)`
// lands on array-specific polyfill
type Box<V> = {
  value: V;
};
declare const b: Box<string[]>;
_atMaybeArray(_ref = b.value).call(_ref, -1);