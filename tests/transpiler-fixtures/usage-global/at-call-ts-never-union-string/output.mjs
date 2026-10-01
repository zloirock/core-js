import "core-js/modules/es.string.at";
function foo(name: string | never) {
  name.at(-1);
}