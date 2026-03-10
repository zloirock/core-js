import "core-js/modules/es.array.at";
function foo<T, U>(items: (T extends U ? number[] : number[]) | null) {
  items.at(-1);
}