import "core-js/modules/es.array.at";
interface Base extends Array<number> {}
interface Derived extends Base {}
function foo(x: Derived) {
  x.at(-1);
}