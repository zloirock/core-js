import _at from "@core-js/pure/actual/instance/at";
// ECMA-262 doesn't admit a directive prologue inside a class StaticBlock - oxc reports
// `directive: null` for the leading string literal, so it stays as a regular expression
// statement. `var _ref` lands right after `{` (before the string), preserving the original
// "directive-as-expression" semantics that the source already expressed.
class C {
  static {
    var _ref;
    "use strict";
    null == (_ref = foo.bar) ? void 0 : _at(_ref).call(_ref, 0);
  }
}