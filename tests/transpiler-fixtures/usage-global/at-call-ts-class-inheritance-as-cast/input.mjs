class MyArray extends Array {}
const Cls = MyArray as typeof MyArray;
function foo(x: InstanceType<typeof Cls>) {
  x.at(-1);
}
