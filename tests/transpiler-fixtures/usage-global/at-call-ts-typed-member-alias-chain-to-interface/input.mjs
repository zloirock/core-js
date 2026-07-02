interface Base { label: string }
type Middle = Base;
type Outer = Middle;
function foo(obj: Outer) {
  obj.label.at(0);
}
