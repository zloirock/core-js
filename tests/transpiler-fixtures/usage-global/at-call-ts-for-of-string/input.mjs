function foo(str: string) {
  for (const ch of str) {
    ch.at(-1);
  }
}
