import "core-js/modules/es.string.at";
interface Base {
  label: string;
}
type Middle = Base;
type Outer = Middle;
function foo(obj: Outer) {
  obj.label.at(0);
}