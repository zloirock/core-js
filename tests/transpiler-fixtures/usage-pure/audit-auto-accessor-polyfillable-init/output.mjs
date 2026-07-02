import _Set from "@core-js/pure/actual/set/constructor";
// stage-3 auto-accessor with a polyfilled built-in initializer plus a decorator: the
// initializer expression is scanned and rewritten to the pure-mode polyfill alias.
class A {
  @dec
  accessor x = new _Set();
}