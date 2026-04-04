function foo(x: string | number[]) {
  return Array.isArray(x) ? x.at(-1) : x.at(0);
}
