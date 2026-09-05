function* gen(): Generator<string, void, string[]> {
  const items = yield 'ready';
  items.at(-1).padEnd(5);
}
