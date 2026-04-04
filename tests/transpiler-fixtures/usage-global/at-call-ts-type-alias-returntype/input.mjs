function getItems(): number[] {
  return [1, 2, 3];
}
type Items = ReturnType<typeof getItems>;
function foo(x: Items) {
  x.at(-1);
}
