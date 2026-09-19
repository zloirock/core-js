interface Container<T> { value: T }
interface MyBox extends Container<string> {}
function foo(x: MyBox) {
  x.value.at(0);
}
