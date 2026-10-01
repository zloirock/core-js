function foo(x) {
  switch (typeof x) {
    case 'object':
      x.at(-1);
      break;
  }
}
