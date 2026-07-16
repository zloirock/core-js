// A caller-lossy body-extract is sound only when every call site is visible. An immediately
// invoked function qualifies - unless its own name is referenced inside, which is an extra
// caller that can supply the param the default would otherwise fill. A JSX tag name is such a
// reference: the element hands the component to a renderer that calls it with props, so the
// param default never runs there and the extracted value would be wrong.
var cond = true;

// The tag name references the function itself - stays verbatim.
export const viaTagName = (function F({ ['from']: from } = Array) {
  return cond ? (cond = false, <F x={1} />) : from;
})();

// The root of a member-expression tag name is the reference; the tail is a prop on it.
export const viaMemberRoot = (function G({ ['of']: of } = Array) {
  return cond ? (cond = false, <G.Sub x={1} />) : of;
})();

// NEGATIVE: an attribute NAME is a prop name, not a binding reference - extract stays sound.
export const attributeNameNotRef = (function H({ ['assign']: assign } = Object) {
  return <div H={1}>{assign({}, { a: 1 }).a}</div>;
})();

// NEGATIVE: a member-expression TAIL is a prop on another binding, not a reference.
export const memberTailNotRef = (function K({ ['entries']: entries } = Object) {
  return <Other.K x={1}>{entries({ a: 1 }).length}</Other.K>;
})();

// NEGATIVE: a namespaced tag name binds nothing - both parts are literals.
export const namespacedNotRef = (function L({ ['keys']: keys } = Object) {
  return <ns:L x={1}>{keys({ a: 1 }).length}</ns:L>;
})();

// NEGATIVE: a lowercase BARE tag names an intrinsic element - the string, not the binding of that
// same spelling - so every call site really is visible and the extract stays sound.
export const intrinsicTagNotRef = (function div({ ['values']: values } = Object) {
  return <div>{values({ a: 1 }).length}</div>;
})();

// A MEMBER tag is an expression whatever its case, so its root references the binding and the
// intrinsic spelling rule must not reach it.
export const memberRootIntrinsicSpelling = (function d({ ['fromEntries']: fromEntries } = Object) {
  return cond ? (cond = false, <d.Sub x={1} />) : fromEntries([['a', 1]]);
})();

// The name is in scope in a PARAM DEFAULT too, so a tag reference there is an extra caller as well.
export const selfRefInParamDefault = (function P({ ['all']: all } = Promise, cb = () => <P x={1} />) {
  return [all, cb];
})();

// NEGATIVE: an intrinsic-spelled tag in a param default references nothing.
export const intrinsicInParamDefault = (function span({ ['race']: race } = Promise, cb = () => <span x={1} />) {
  return [race, cb];
})();

