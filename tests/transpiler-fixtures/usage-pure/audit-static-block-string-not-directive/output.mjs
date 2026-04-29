import _at from "@core-js/pure/actual/instance/at";
// ECMA-262 doesn't admit a directive prologue inside a class static block - the leading
// string literal stays as a regular expression statement, not a directive. The injected
// `var _ref` lands right after `{` (before the string), preserving the original
// "directive-as-expression" semantics already expressed by the source.
class C {
  static {
    var _ref;
    "use strict";
    null == (_ref = foo.bar) ? void 0 : _at(_ref).call(_ref, 0);
  }
}