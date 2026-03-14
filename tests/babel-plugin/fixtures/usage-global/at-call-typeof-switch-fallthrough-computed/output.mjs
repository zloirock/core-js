import "core-js/modules/es.string.at";
const T = 'string';
function foo(x) {
  switch (typeof x) {
    case T:
    case 'number':
      x.at(0);
      break;
  }
}