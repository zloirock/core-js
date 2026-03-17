type Items = Array<string>;
function foo(items: Items) {
  for (const x of items) {
    x.at(-1);
  }
}
