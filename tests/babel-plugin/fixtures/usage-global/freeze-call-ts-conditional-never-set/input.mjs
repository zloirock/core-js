function foo<T>(items: T extends number ? Set<string> : never) {
  Object.freeze(items);
}
