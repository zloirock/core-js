import "core-js/modules/es.string.at";
function foo(x) {
  switch (typeof x) {
    case 'object':
      break;
    default:
      x.at(-1);
  }
}