import "core-js/modules/es.string.at";
function greet(name: string) {
  const alias: typeof name = name;
  alias.at(-1);
}