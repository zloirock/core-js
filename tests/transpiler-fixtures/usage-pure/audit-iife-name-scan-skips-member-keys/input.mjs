// the caller-lossy param emission is allowed only when every call site is visible, which a named
// IIFE stops being as soon as its own name is REFERENCED inside it. a member key that merely spells
// that name is a name literal, not a reference - class methods, fields, accessors, statics, object
// methods and a plain member tail all read as text, so the extraction still fires. a real self-call
// keeps the parameter verbatim, since the recursive argument has to win.
// the REST element is what puts that decision on the table at all: it collects keys no synthesized
// literal can enumerate, so the caller-correct synth declines permanently and the scan's verdict is
// what picks between extract and verbatim
const withMethod = (function f({ from, ...rest } = Array) {
  class C { f() {} }
  return [from, rest, C];
})();
const withField = (function g({ of, ...rest } = Array) {
  class C { g = 1; }
  return [of, rest, C];
})();
const withAccessor = (function h({ entries, ...rest } = Object) {
  class C { get h() { return 1; } }
  return [entries, rest, C];
})();
const withStatic = (function k({ keys, ...rest } = Object) {
  class C { static k() {} }
  return [keys, rest, C];
})();
const withObjectMethod = (function m({ values, ...rest } = Object) {
  const o = { m() {} };
  return [values, rest, o];
})();
const withMemberTail = (function n({ fromEntries, ...rest } = Object) {
  const o = {};
  o.n = 1;
  return [fromEntries, rest, o];
})();
// a REAL self-reference is an invisible caller - the parameter stays verbatim
const withRecursion = (function r({ groupBy, ...rest } = Object) {
  return globalThis.never ? r({ groupBy: null }) : [groupBy, rest];
})();
export { withMethod, withField, withAccessor, withStatic, withObjectMethod, withMemberTail, withRecursion };
