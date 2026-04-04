interface StringIterable extends Iterable<string> {}
function foo(items: StringIterable) {
  for (const x of items) {
    x.at(-1);
  }
}
