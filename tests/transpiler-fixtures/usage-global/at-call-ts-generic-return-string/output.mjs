import "core-js/modules/es.string.at";
function identity<T>(x: T): T {
  return x;
}
identity('hello').at(-1);