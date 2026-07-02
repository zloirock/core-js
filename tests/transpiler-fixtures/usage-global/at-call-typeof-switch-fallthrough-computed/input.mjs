const T = 'string';

function foo(x) {
  switch (typeof x) {
    case T:
    case 'number':
      x.at(0);
      break;
  }
}
