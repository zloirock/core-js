function foo<T extends number[]>(): T | null {
  return null;
}
foo().at(-1);
