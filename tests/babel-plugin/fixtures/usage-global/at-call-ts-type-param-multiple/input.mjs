function foo<T extends string, U extends number[]>(x: U) {
  x.at(-1);
}
