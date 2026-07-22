import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
// A caller-lossy param-destructure body-extract relocates the destructured binding into a body-top
// `let`; a JSX-TAG read of that binding in a later param default evaluates in PARAM scope, which the
// body `let` cannot reach - so the extract must bail to the inline default that keeps the binding in
// the param list. an intrinsic (lowercase bare) tag names a string, not the binding, and an
// attribute NAME is a prop key - both carry no read, so the extract stays sound. the rest element
// makes the synth-swap bail first, so the body-extract path is the one under test.

// a bare JSX tag references the binding - bail so `<From />` keeps seeing the param binding
const tagRead = (function ({ from: From = _Array$from, ...rest } = Array, x = <From />) {
  return [From, x, rest];
})();

// the ROOT of a member-expression tag references the binding (the tail is a prop on it) - bail
const memberRootRead = (function ({ of: Of = _Array$of, ...rest } = Array, x = <Of.Sub />) {
  return [Of, x, rest];
})();

// NEGATIVE: `<race />` is a lowercase intrinsic tag (the string "race"), not the binding - extract
const intrinsicTag = (function ({ race: _unused, ...rest } = _Promise, x = <race />) {
  let race = _Promise$race;
  return [race, x, rest];
})();

// NEGATIVE: `H` as an attribute NAME is a prop key, not a reference - extract
const attributeName = (function ({ hasOwn: _unused2, ...rest } = Object, x = <div H={1} />) {
  let H = _Object$hasOwn;
  return [H, x, rest];
})();

// NEGATIVE: a class-METHOD name in a param default is a member key, not a reference. the walker
// delegates every name-literal slot (JSX attribute / member-tag tail, object / class / method /
// field key) to the shared non-reference-position predicate, so the extract stays sound on both
// parsers (babel `ClassMethod` / estree `MethodDefinition`)
const classMethodKey = (function ({ fromEntries: _unused3, ...rest } = Object, x = class { fromEntries() {} }) {
  let fromEntries = _Object$fromEntries;
  return [fromEntries, x, rest];
})();

// NEGATIVE: a class-FIELD name is a member key too (babel `ClassProperty` / estree `PropertyDefinition`)
const classFieldKey = (function ({ groupBy: _unused4, ...rest } = Object, x = class { groupBy = 1; }) {
  let groupBy = _Object$groupBy;
  return [groupBy, x, rest];
})();

export { tagRead, memberRootRead, intrinsicTag, attributeName, classMethodKey, classFieldKey };
