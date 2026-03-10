import "core-js/modules/es.array.at";
function foo<T>(items: T extends string ? number[] | null : number[] | null) {
  items.at(-1);
}