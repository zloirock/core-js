import "core-js/modules/es.string.at";
function foo(name: string | null) {
  name.at(-1);
}