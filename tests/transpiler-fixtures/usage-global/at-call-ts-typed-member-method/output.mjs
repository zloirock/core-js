import "core-js/modules/es.array.at";
interface Config {
  getItems(): string[];
}
function foo(c: Config) {
  c.getItems().at(-1);
}