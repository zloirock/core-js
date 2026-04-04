function foo(x) {
  switch (typeof x) {
    case 'string': {
      doA();
      break;
    }
    case 'number':
      x.at(0);
      break;
  }
}
