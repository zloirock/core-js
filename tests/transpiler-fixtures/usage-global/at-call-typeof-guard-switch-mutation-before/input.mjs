function foo() {
  let x = bar();
  x = baz();
  switch (typeof x) {
    case 'string':
      x.at(-1);
      break;
  }
}
