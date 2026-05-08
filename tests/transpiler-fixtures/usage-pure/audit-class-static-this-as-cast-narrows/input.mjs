// `(this as any).from(...)` static-inheritance dispatch lock: TS users sometimes wrap
// `this` in a cast to escape strict-mode narrowing. before the fix, isInheritedStaticLookup
// peeled only ParenthesizedExpression and saw TSAsExpression as opaque - falling through
// to the instance-method path. after the fix, unwrapRuntimeExpr strips both parens and
// TS expression wrappers, exposing the bare `this` and triggering Array.from polyfill
class C extends Array {
  static makeFrom(items: Iterable<number>) {
    return (this as any).from(items);
  }
}

C.makeFrom([1, 2, 3]);
