import "core-js/modules/es.array.at";
function foo<T extends number[]>(): T | null {
  return null;
}
foo().at(-1);