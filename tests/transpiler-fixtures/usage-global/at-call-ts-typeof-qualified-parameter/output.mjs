import "core-js/modules/es.array.at";
function foo(config: {
  items: string[];
}) {
  const x: typeof config.items = config.items;
  x.at(-1);
}