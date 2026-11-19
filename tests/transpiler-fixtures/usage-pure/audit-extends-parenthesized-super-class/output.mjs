import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `class C extends (Promise)` - parenthesized super-class expression. plugin must see
// through the parens and treat `Promise` as the super-class, rewriting `super.try` to
// the `Promise.try` pure import
class C extends _Promise {
  static x() {
    return _Promise$try.call(this, r => r());
  }
}
C.x();