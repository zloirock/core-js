const arr = [1, 2, 3];
function foo(items: typeof arr) {
  items.at(-1);
}
