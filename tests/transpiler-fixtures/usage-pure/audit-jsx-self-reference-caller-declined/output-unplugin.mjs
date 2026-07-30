import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
// A caller-lossy body-extract is sound only when every call site is visible. An immediately
// invoked function qualifies - unless its own name is referenced inside, which is an extra
// caller that can supply the param the default would otherwise fill. A JSX tag name is such a
// reference: the element hands the component to a renderer that calls it with props, so the
// param default never runs there and the extracted value would be wrong.
// Every pattern here carries a REST element on purpose: it collects keys no synthesized literal can
// enumerate, so the caller-correct emission is genuinely impossible and the extract-vs-verbatim
// decision the tag-name scan drives is the one actually on the table. The same shapes WITHOUT a rest
// synthesize instead, and are locked separately.
var cond = true;

// The tag name references the function itself - stays verbatim.
export const viaTagName = (function F({ from, ...rest } = Array) {
  return cond ? (cond = false, <F x={1} />) : [from, rest];
})();

// The root of a member-expression tag name is the reference; the tail is a prop on it.
export const viaMemberRoot = (function G({ of, ...rest } = Array) {
  return cond ? (cond = false, <G.Sub x={1} />) : [of, rest];
})();

// NEGATIVE: an attribute NAME is a prop name, not a binding reference - extract stays sound.
export const attributeNameNotRef = (function H({ assign: _unused, ...rest } = Object) {
  let assign = _Object$assign;
  return <div H={1}>{assign({}, rest, { a: 1 }).a}</div>;
})();

// NEGATIVE: a member-expression TAIL is a prop on another binding, not a reference.
export const memberTailNotRef = (function K({ entries: _unused2, ...rest } = Object) {
  let entries = _Object$entries;
  return <Other.K x={1}>{entries(rest).length}</Other.K>;
})();

// NEGATIVE: a namespaced tag name binds nothing - both parts are literals.
export const namespacedNotRef = (function L({ keys: _unused3, ...rest } = Object) {
  let keys = _Object$keys;
  return <ns:L x={1}>{keys(rest).length}</ns:L>;
})();

// NEGATIVE: a lowercase BARE tag names an intrinsic element - the string, not the binding of that
// same spelling - so every call site really is visible and the extract stays sound.
export const intrinsicTagNotRef = (function div({ values: _unused4, ...rest } = Object) {
  let values = _Object$values;
  return <div>{values(rest).length}</div>;
})();

// A MEMBER tag is an expression whatever its case, so its root references the binding and the
// intrinsic spelling rule must not reach it.
export const memberRootIntrinsicSpelling = (function d({ fromEntries, ...rest } = Object) {
  return cond ? (cond = false, <d.Sub x={1} />) : [fromEntries([['a', 1]]), rest];
})();

// The name is in scope in a PARAM DEFAULT too, so a tag reference there is an extra caller as well.
export const selfRefInParamDefault = (function P({ all, ...rest } = _Promise, cb = () => <P x={1} />) {
  return [all, rest, cb];
})();

// NEGATIVE: an intrinsic-spelled tag in a param default references nothing.
export const intrinsicInParamDefault = (function span({ race: _unused5, ...rest } = _Promise, cb = () => <span x={1} />) {
  let race = _Promise$race;
  return [race, rest, cb];
})();