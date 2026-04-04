function foo(x) {
  switch (typeof x) {
    case 'string':
      x.at(-1);
      break;
  }
}
