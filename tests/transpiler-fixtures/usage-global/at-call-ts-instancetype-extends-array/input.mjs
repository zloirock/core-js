class MyArray extends Array {}
function foo(x: InstanceType<typeof MyArray>) {
  x.at(-1);
}
