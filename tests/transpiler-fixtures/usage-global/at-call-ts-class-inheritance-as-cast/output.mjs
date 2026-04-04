import "core-js/modules/es.array.at";
class MyArray extends Array {}
const Cls = MyArray as typeof MyArray;
function foo(x: InstanceType<typeof Cls>) {
  x.at(-1);
}