function foo(x: Generator<string>) {
  for (const item of x) {
    item.at(0);
  }
}
