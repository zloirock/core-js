function foo(x: (() => void) | string) {
  if (typeof x === 'function') {
    // function branch
  } else {
    x.at(-1);
  }
}
