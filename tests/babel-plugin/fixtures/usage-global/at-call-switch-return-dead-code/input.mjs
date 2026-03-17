function foo(x) {
  switch (typeof x) {
    case 'object':
      return;
      doSomething();
    case 'string':
      x.at(0);
      break;
  }
}
