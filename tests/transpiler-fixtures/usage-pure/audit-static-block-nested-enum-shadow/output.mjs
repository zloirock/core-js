// nested classes each with their own StaticBlock, both declaring `enum Map`. the inner
// access must bind to the innermost enum (closest enclosing shadow), not the outer's,
// so the polyfill stays suppressed at both depths
let outer: unknown, inner: unknown;
class Outer {
  static {
    enum Map {
      Outer
    }
    outer = new Map.Outer();
    class Inner {
      static {
        enum Map {
          Inner
        }
        inner = new Map.Inner();
      }
    }
  }
}
export { Outer, outer, inner };