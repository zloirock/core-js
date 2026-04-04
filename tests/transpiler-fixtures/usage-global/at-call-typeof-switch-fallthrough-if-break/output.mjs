function foo(x) {
  switch (typeof x) {
    case 'string':
      if (a) {
        doA();
        break;
      } else {
        doB();
        break;
      }
    case 'number':
      x.at(0);
      break;
  }
}