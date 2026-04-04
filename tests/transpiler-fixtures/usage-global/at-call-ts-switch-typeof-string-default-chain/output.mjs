import "core-js/modules/es.array.at";
function foo(x: string | number[]) {
  switch (typeof x) {
    case 'string':
      break;
    default:
      x.at(-1);
  }
}