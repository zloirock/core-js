import "core-js/modules/es.string.at";
type Pair = [string, number];
type Alias = Pair;
type First = Alias[0];
function foo(x: First) {
  x.at(0);
}