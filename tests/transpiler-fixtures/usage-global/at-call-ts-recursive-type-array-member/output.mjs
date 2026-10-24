import "core-js/modules/es.array.at";
type Tree = {
  value: string;
  children: Tree[];
};
function f(t: Tree) {
  t.children.at(0);
}