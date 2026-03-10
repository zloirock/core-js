function foo<T>(items: T extends string ? Set<string> : Set<number>) {
  Object.freeze(items);
}
