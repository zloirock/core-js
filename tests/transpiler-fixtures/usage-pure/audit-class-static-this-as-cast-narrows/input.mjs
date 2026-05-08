// `(this as any).from(...)` inside a static `class C extends Array` must inherit `Array.from`.
// Inherited-static lookup must peel TS expression wrappers; otherwise it falls back to instance dispatch.
class C extends Array {
  static makeFrom(items: Iterable<number>) {
    return (this as any).from(items);
  }
}

C.makeFrom([1, 2, 3]);
