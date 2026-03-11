function foo<T>(x: T): (T) {
  return x;
}
foo([1, 2, 3]).at(-1);
