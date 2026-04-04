interface StringList extends Array<string> {}
function foo(arr: StringList) {
  for (const x of arr) {
    x.at(-1);
  }
}
