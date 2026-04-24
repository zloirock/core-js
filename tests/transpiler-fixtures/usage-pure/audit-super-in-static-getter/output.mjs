import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `super.X` inside a static *getter* - getters count as ClassMethods and `m.static` is
// true, so `findEnclosingClassMember` yields `isStatic: true`. The super.X call inside
// should polyfill. Plugin should NOT treat the getter body differently from a method body.
class C extends _Promise {
  static get helper() {
    return _Promise$allSettled.call(this, []);
  }
  static set setter(x) {
    _Promise$resolve.call(this, x);
  }
}