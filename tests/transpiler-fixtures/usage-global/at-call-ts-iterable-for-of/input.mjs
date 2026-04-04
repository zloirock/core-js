function foo(x: Iterable<string>) {
  for (const item of x) {
    item.at(0);
  }
}
