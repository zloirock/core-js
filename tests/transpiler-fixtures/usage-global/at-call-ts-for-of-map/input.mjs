function foo(map: Map<string, number>) {
  for (const entry of map) {
    entry.at(-1);
  }
}
