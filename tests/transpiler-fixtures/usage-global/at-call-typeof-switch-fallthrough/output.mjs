import "core-js/modules/es.string.at";
function foo(x) {
  switch (typeof x) {
    case 'string':
    case 'number':
      x.at(0);
      break;
  }
}