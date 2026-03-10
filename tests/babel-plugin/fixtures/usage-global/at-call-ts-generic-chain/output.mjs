import "core-js/modules/es.array.at";
function identity<T>(x: T): T {
  return x;
}
const fn = identity;
fn([1, 2, 3]).at(-1);