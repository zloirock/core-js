function foo<T>(x: T): T | never {
  return x;
}
foo([1, 2, 3]).at(-1);
