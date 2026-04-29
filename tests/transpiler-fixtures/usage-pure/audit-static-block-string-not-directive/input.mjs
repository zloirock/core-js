// ECMA-262 doesn't admit a directive prologue inside a class static block - the leading
// string literal stays as a regular expression statement, not a directive. The injected
// `var _ref` lands right after `{` (before the string), preserving the original
// "directive-as-expression" semantics already expressed by the source.
class C {
  static {
    "use strict";
    foo.bar?.at(0);
  }
}
