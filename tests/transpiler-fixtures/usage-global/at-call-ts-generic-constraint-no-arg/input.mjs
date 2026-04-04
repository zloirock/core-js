function foo<T extends string>(): T | null {
  return null;
}
foo().at(-1);
