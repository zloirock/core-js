import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `class C extends (Promise)` — oxc-parser preserves ParenthesizedExpression wrapper around
// superClass; buildSuperStaticMeta peels it. babel strips parens pre-visit, so both converge
class C extends _Promise {
  static x() {
    return _Promise$try.call(this, r => r());
  }
}
C.x();