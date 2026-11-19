import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// what the parameter shadows is the GLOBAL, not itself: a constraint on a container-named
// parameter still resolves, so the array module below has to survive
function constrained<Array extends number[]>(x: Array) {
  return x.flat();
}