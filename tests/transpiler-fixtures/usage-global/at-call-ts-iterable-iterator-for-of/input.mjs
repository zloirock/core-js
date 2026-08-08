function foo(x: IterableIterator<string>) {
  for (const item of x) {
    item.at(0);
  }
}
