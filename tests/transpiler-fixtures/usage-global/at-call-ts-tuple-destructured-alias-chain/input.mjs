type Inner = [string, number];
type Outer = Inner;
function foo([name, age]: Outer) {
  name.at(0);
}
