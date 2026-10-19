// TS `ReadonlyArray<T>` inference: the array element type still flows through to the
// call site so the array-specific polyfill variant is picked.
type ElementOf<T> = T extends ReadonlyArray<infer U> ? U : never;
function wrap<T extends readonly string[]>(x: T): ElementOf<T>[] {
  // @ts-expect-error a return the annotation does not admit is the shape under test
  return x.slice();
}
wrap(['a', 'b', 'c']).at(0);
