import "core-js/modules/es.string.at";
function foo<T>(x: T): T | undefined {
  return x;
}
foo('hello').at(-1);