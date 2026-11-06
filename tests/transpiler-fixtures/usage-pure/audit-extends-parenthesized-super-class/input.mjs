// `class C extends (Promise)` - parenthesized super-class expression. plugin must see
// through the parens and treat `Promise` as the super-class, rewriting `super.try` to
// the `Promise.try` pure import
class C extends (Promise) {
  static x() { return super.try(r => r()); }
}
C.x();
