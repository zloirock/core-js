function foo(items: $ReadOnlyArray<string>) {
  for (const x of items) {
    x.at(-1);
  }
}
