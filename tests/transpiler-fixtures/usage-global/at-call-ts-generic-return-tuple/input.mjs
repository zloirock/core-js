function foo<T>(x: T): [T, T] {
  return [x, x];
}
foo('x').at(-1);
