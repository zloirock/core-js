export type Strings = string[];
function foo(x: Strings) {
  x.at(-1).padEnd(5);
}
