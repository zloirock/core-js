function foo(x) {
  switch (typeof x) {
    case 'object':
      break;
      console.log('unreachable');
    case 'string':
      x.at(0);
      break;
  }
}
