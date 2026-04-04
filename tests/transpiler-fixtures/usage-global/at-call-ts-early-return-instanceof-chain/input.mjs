function process(x: string | number[]) {
  if (x instanceof Array) return;
  x.at(-1);
}
