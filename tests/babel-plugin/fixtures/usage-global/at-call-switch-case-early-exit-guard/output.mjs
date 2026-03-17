import "core-js/modules/es.string.at";
function foo(x, mode) {
  switch (mode) {
    case 'a':
      if (typeof x !== 'string') return;
      x.at(0);
      break;
  }
}