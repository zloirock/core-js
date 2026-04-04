import "core-js/modules/es.array.includes";
function foo<T>(x: T): T | null {
  return x;
}
foo([1, 2, 3]).includes(1);