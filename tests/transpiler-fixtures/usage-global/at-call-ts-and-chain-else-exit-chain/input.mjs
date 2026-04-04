function foo(x: string | number | number[]) {
  if (typeof x !== 'string' && !Array.isArray(x)) {
    // narrowed branch
  } else {
    return;
  }
  x.at(-1);
}
