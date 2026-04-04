function foo<T>(x: T): Array<T> {
  return [x];
}
foo('x').at(-1);
