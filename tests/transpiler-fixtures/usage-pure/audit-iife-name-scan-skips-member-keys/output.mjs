import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// the caller-lossy param emission is allowed only when every call site is visible, which a named
// IIFE stops being as soon as its own name is REFERENCED inside it. a member key that merely spells
// that name is a name literal, not a reference - class methods, fields, accessors, statics, object
// methods and a plain member tail all read as text, so the extraction still fires. a real self-call
// keeps the parameter verbatim, since the recursive argument has to win.
// the REST element is what puts that decision on the table at all: it collects keys no synthesized
// literal can enumerate, so the caller-correct synth declines permanently and the scan's verdict is
// what picks between extract and verbatim
const withMethod = function f({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  class C {
    f() {}
  }
  return [from, rest, C];
}();
const withField = function g({
  of: _unused2,
  ...rest
} = Array) {
  let of = _Array$of;
  class C {
    g = 1;
  }
  return [of, rest, C];
}();
const withAccessor = function h({
  entries: _unused3,
  ...rest
} = Object) {
  let entries = _Object$entries;
  class C {
    get h() {
      return 1;
    }
  }
  return [entries, rest, C];
}();
const withStatic = function k({
  keys: _unused4,
  ...rest
} = Object) {
  let keys = _Object$keys;
  class C {
    static k() {}
  }
  return [keys, rest, C];
}();
const withObjectMethod = function m({
  values: _unused5,
  ...rest
} = Object) {
  let values = _Object$values;
  const o = {
    m() {}
  };
  return [values, rest, o];
}();
const withMemberTail = function n({
  fromEntries: _unused6,
  ...rest
} = Object) {
  let fromEntries = _Object$fromEntries;
  const o = {};
  o.n = 1;
  return [fromEntries, rest, o];
}();
// a REAL self-reference is an invisible caller - the parameter stays verbatim
const withRecursion = function r({
  groupBy,
  ...rest
} = Object) {
  return _globalThis.never ? r({
    groupBy: null
  }) : [groupBy, rest];
}();
export { withMethod, withField, withAccessor, withStatic, withObjectMethod, withMemberTail, withRecursion };