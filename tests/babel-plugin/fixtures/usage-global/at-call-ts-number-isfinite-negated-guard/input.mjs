function foo(x: string | number) {
  if (!Number.isFinite(x)) {
    x.at(-1);
  }
}
