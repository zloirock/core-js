function foo() {
  let x = bar();
  switch (typeof x) {
    case 'string':
      x = baz();
      x.at(-1);
      break;
  }
}
