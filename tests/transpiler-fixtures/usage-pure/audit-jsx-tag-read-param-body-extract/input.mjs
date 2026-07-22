// A caller-lossy param-destructure body-extract relocates the destructured binding into a body-top
// `let`; a JSX-TAG read of that binding in a later param default evaluates in PARAM scope, which the
// body `let` cannot reach - so the extract must bail to the inline default that keeps the binding in
// the param list. an intrinsic (lowercase bare) tag names a string, not the binding, and an
// attribute NAME is a prop key - both carry no read, so the extract stays sound. the rest element
// makes the synth-swap bail first, so the body-extract path is the one under test.

// a bare JSX tag references the binding - bail so `<From />` keeps seeing the param binding
const tagRead = (function ({ from: From, ...rest } = Array, x = <From />) {
  return [From, x, rest];
})();

// the ROOT of a member-expression tag references the binding (the tail is a prop on it) - bail
const memberRootRead = (function ({ of: Of, ...rest } = Array, x = <Of.Sub />) {
  return [Of, x, rest];
})();

// NEGATIVE: `<race />` is a lowercase intrinsic tag (the string "race"), not the binding - extract
const intrinsicTag = (function ({ race, ...rest } = Promise, x = <race />) {
  return [race, x, rest];
})();

// NEGATIVE: `H` as an attribute NAME is a prop key, not a reference - extract
const attributeName = (function ({ hasOwn: H, ...rest } = Object, x = <div H={1} />) {
  return [H, x, rest];
})();

// NEGATIVE: a class-METHOD name in a param default is a member key, not a reference. the walker
// delegates every name-literal slot (JSX attribute / member-tag tail, object / class / method /
// field key) to the shared non-reference-position predicate, so the extract stays sound on both
// parsers (babel `ClassMethod` / estree `MethodDefinition`)
const classMethodKey = (function ({ fromEntries, ...rest } = Object, x = class { fromEntries() {} }) {
  return [fromEntries, x, rest];
})();

// NEGATIVE: a class-FIELD name is a member key too (babel `ClassProperty` / estree `PropertyDefinition`)
const classFieldKey = (function ({ groupBy, ...rest } = Object, x = class { groupBy = 1; }) {
  return [groupBy, x, rest];
})();

export { tagRead, memberRootRead, intrinsicTag, attributeName, classMethodKey, classFieldKey };
