import "core-js/modules/es.array.at";
function getItems<T extends {
  items: string[];
}>(container: T): T["items"] {
  return container.items;
}
getItems({
  items: ["a", "b"]
}).at(0);