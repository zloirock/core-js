import "core-js/modules/es.array.at";
function foo<T, U>(x: T, y: U): T | null {
  return x;
}
foo([1, 2, 3], 'y').at(-1);