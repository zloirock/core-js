import "core-js/modules/es.array.at";
function foo(config: {
  items: number[];
}) {
  config.items.at(-1);
}