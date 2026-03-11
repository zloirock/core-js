import "core-js/modules/es.array.at";
function foo(x: string | number[]) {
  if (typeof x === 'string') {
    // string branch
  } else {
    x.at(-1);
  }
}