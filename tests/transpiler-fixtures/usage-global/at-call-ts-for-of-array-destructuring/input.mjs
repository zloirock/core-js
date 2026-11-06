function foo(pairs: string[][]) {
  for (const [a] of pairs) {
    a.at(-1);
  }
}
