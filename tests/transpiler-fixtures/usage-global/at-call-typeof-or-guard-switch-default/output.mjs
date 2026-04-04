import "core-js/modules/es.array.at";
function foo(x) {
  switch (typeof x) {
    case 'string':
    case 'number':
      break;
    default:
      x.at(-1);
  }
}