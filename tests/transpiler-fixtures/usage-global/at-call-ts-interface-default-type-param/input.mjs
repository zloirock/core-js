interface Container<T = number[]> {
  items: T;
}

function foo(x: Container) {
  x.items.at(0);
}
