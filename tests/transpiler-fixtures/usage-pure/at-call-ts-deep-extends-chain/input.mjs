interface Leaf<U> { value: U }
interface Middle<T> extends Leaf<T> {}
interface Root extends Middle<string> {}
function foo(x: Root) {
  x.value.at(0);
}
