type Items = string[];
function foo(items: Items) {
  for (const item of items) {
    item.at(-1);
  }
}
