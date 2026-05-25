import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// `const X` and block-level `class X` bind to the enclosing block only. Outside-block
// references must not be suppressed. Multiple shadows of the same name in distinct
// blocks each apply only within their own block range.
@(function () {
  if (a) {
    const Set = 1;
    void Set;
  }
  if (b) {
    class Promise {}
    void Promise;
  }
  return [new _Set(), new _Promise(() => {})];
})
class C {}
[C];