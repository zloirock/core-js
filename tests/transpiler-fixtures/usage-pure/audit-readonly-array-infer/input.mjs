type ElementOf<T> = T extends ReadonlyArray<infer U> ? U : never;
function wrap<T extends readonly string[]>(x: T): ElementOf<T>[] {
  return x.slice();
}
wrap(['a', 'b', 'c']).at(0);
