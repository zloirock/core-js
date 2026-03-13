function foo(x) {
  switch (typeof x) {
    case 'string':
    case 'number':
      x.at(0);
      break;
  }
}
