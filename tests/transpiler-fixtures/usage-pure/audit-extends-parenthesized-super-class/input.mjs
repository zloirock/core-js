// `class C extends (Promise)` — oxc-parser preserves ParenthesizedExpression wrapper around
// superClass; buildSuperStaticMeta peels it. babel strips parens pre-visit, so both converge
class C extends (Promise) {
  static x() { return super.try(r => r()); }
}
C.x();
