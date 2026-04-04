function foo(x: string) {
  {
    const x = [1, 2, 3];
    x.at(-1);
  }
  x.at(-1);
}
