type StringOrNumber = string | number;
type MyType = StringOrNumber;
function foo(x: MyType) {
  if (typeof x === 'string') {
    x.at(0);
  }
}
