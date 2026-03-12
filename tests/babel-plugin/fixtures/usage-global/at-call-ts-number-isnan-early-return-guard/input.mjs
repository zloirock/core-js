function foo(x: string | number) {
  if (Number.isNaN(x)) return;
  x.at(-1);
}
