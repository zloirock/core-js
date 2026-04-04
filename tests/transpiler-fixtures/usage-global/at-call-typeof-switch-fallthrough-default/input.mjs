function foo(x) {
  switch (typeof x) {
    case 'string':
    default:
      x.at(0);
      break;
  }
}
