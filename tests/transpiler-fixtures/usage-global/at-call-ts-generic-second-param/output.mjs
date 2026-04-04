import "core-js/modules/es.array.at";
function second<T, U>(a: T, b: U): U {
  return b;
}
second('x', [1, 2, 3]).at(-1);