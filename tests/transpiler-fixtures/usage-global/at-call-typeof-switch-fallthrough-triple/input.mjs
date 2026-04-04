function foo(x) {
  switch (typeof x) {
    case 'string':
    case 'number':
    case 'bigint':
      x.at(0);
      break;
  }
}
