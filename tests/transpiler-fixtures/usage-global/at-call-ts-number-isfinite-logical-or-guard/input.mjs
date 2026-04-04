function foo(x: string | number) {
  return Number.isFinite(x) || x.at(-1);
}
