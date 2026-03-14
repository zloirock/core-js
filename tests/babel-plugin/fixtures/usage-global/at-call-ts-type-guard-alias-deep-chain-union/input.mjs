type Base = string | number;
type Middle = Base;
type Outer = Middle;
function foo(x: Outer) {
  if (typeof x === 'string') {
    x.at(0);
  }
}
