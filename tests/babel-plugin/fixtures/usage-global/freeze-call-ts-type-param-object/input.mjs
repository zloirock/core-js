function foo<T extends { key: string }>(x: T) {
  Object.freeze(x);
}
