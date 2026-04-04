type StringSet = Set<string>;
function foo(s: StringSet) {
  for (const x of s) {
    x.at(-1);
  }
}
