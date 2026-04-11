import "core-js/modules/es.function.name";
type Factory<T> = new () => T;
function make(): Factory<string> {
  return String;
}
make().name;
make().at(-1);