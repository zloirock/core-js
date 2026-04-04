import "core-js/modules/es.array.at";
function foo(items: NonNullable<number[] | null>) {
  items.at(-1);
}