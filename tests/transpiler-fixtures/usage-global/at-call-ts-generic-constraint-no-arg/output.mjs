import "core-js/modules/es.string.at";
function foo<T extends string>(): T | null {
  return null;
}
foo().at(-1);