// TS mapped type as a direct generic return: the type-arg substitution flows through
// to call-site narrowing for the polyfill rewrite.
function wrap<T extends number[]>(x: T): { [K in keyof T]: T[K] } {
  return x;
}
wrap([1, 2, 3]).at(0);
