// a write whose target is spelled through a TS wrapper - `a! = v`, `(b as any) = v` - is one both
// scope trackers skip, so the canonical write scan is its only recorder: once recorded, the binding
// no longer holds the array it was declared with, and the read takes the generic dispatch instead
// of the array-specific helper that would throw on the string the write installed
export function f() {
  let a = [];
  // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
  a! = 's';
  let b = [];
  (b as any) = 's';
  // the bare spelling of the same write narrows to the string it reaches
  let c = [];
  // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
  c = 's';
  return [a.at(0), b.includes('s'), c.at(0)];
}
