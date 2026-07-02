function foo(x: string | Map<string, number>) {
  if (x instanceof Map) {
    // map branch
  } else {
    x.at(-1);
  }
}
