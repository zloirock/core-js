function foo<T>(x: T): T & { extra: boolean } {
  return x as any;
}
foo([1, 2, 3]).at(-1);
