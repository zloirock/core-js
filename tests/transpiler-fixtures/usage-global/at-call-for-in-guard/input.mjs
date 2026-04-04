function foo(obj) {
  for (const key in obj) {
    key.at(-1);
  }
}
