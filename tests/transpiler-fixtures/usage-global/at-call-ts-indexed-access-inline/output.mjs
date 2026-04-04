import "core-js/modules/es.array.at";
function foo(x: {
  items: number[];
  name: string;
}["items"]) {
  x.at(-1);
}