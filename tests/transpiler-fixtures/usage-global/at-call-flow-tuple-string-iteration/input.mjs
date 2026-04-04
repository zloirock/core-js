function foo(x: [string, string]) {
  for (const s of x) {
    s.at(0);
  }
}
