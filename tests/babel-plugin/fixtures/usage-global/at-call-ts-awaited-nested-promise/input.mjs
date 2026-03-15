function foo(x: Awaited<Promise<Promise<string>>>) {
  x.at(0).padStart(3);
}
