import "core-js/modules/es.array.at";
function foo(x) {
  switch (typeof x) {
    case 'number':
      break;
    case 'string':
      if (a) {
        break;
      } else {
        break;
      }
    default:
      x.at(-1);
  }
}