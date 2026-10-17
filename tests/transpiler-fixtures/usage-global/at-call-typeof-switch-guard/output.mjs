import "core-js/modules/es.string.at";
function foo(x) {
  switch (typeof x) {
    case 'string':
      x.at(-1);
      break;
  }
}