function wrap<T extends number[]>(x: T): { [K in keyof T]: T[K] } {
  return x;
}
wrap([1, 2, 3]).at(0);
