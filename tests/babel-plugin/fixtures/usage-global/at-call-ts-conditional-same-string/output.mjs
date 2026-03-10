import "core-js/modules/es.string.at";
function foo<T>(name: T extends number ? string : string) {
  name.at(-1);
}