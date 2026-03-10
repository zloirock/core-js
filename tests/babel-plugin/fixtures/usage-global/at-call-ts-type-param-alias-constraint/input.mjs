type Items = number[];
function foo<T extends Items>(x: T) {
  x.at(-1);
}
