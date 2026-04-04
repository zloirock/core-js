function foo(x) {
  switch (typeof x) {
    case 'string':
    case 'object':
      break;
    default:
      x.at(-1);
  }
}
