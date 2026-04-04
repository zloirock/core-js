import "core-js/modules/es.string.at";
function foo(name: NonNullable<string | undefined>) {
  name.at(-1);
}