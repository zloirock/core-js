import "core-js/modules/es.array.at";
interface MyArray extends Array<number> {
  custom(): void;
}
function foo(x: MyArray) {
  x.at(-1);
}