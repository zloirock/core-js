import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type Empty = [];
// @ts-expect-error a tuple index tsc refuses is the shape under test
function f(x: Empty[0]) {
  x.at(0);
}