import "core-js/modules/es.array.at";
function foo(x) {
  switch (typeof x) {
    case 'object':
      x.at(-1);
      break;
  }
}