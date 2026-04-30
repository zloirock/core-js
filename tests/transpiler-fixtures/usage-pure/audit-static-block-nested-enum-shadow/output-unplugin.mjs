// nested class with its own static block, each declaring an `enum Map` shadow.
// `findTSRuntimeBindingInPath` walks parentPath up from the inner `Map.Foo` member
// expression and must stop at the INNER StaticBlock body (the closest enclosing
// anchor) so the inner shadow is detected correctly without being subsumed by the
// outer's enum (which would still shadow but tests a different path)
let outer: unknown, inner: unknown;
class Outer {
  static {
    enum Map { Outer }
    outer = new Map.Outer();
    class Inner {
      static {
        enum Map { Inner }
        inner = new Map.Inner();
      }
    }
  }
}
export { Outer, outer, inner };