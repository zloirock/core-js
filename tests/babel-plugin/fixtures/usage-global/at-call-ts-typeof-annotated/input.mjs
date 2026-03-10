const items: number[] = getData();
function foo(x: typeof items) {
  x.at(-1);
}
