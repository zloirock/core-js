function foo<T>(x: T): T | null {
  return x;
}
foo([1, 2, 3]).at(-1);
