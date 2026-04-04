function process(x: string | number[]) {
  return x instanceof Array ? x.at(-1) : null;
}
