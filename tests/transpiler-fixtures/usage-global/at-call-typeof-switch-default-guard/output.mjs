import "core-js/modules/es.array.at";
function foo(x) {
  switch (typeof x) {
    case 'string':
      break;
    case 'number':
      break;
    default:
      x.at(-1);
  }
}