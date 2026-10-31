type Inner<T> = { v: T };
type Outer<T> = Inner<T>;
function foo(x: Outer<string>) {
  x.v.at(0);
}
