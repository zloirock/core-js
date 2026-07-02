function foo<T>(x: T): T | null | undefined {
  return x;
}
foo([1, 2, 3]).at(-1);
