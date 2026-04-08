type Container<T> = { value: T };
type StringContainer = Container<string>;
function foo(x: StringContainer) {
  x.value.at(0);
}
