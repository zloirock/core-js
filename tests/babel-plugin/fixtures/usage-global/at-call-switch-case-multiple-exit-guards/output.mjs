import "core-js/modules/es.string.at";
function foo(x, mode) {
  switch (mode) {
    case 'a':
      if (typeof x !== 'string') return;
      if (typeof x !== 'string') throw new Error();
      x.at(0);
      break;
  }
}