interface MySet extends Set<number> {
  custom(): void;
}

function foo(x: MySet) {
  x.keys();
}
