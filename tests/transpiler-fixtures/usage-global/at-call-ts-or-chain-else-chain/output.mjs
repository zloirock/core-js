function foo(x: string | number | number[]) {
  if (typeof x === 'string' || Array.isArray(x)) {
    // matched branch
  } else {
    x.at(-1);
  }
}