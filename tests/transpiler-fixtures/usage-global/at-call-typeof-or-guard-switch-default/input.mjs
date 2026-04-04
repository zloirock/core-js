function foo(x) {
  switch (typeof x) {
    case 'string':
    case 'number':
      break;
    default:
      x.at(-1);
  }
}
