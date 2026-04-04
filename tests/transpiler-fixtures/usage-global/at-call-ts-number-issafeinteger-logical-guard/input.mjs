function foo(x: string | number) {
  return Number.isSafeInteger(x) && x.at(-1);
}
