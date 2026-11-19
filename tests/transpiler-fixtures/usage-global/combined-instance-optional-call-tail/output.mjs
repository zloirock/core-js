import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// Combining instance calls retains an optional method in the surviving tail.
export function read(a) {
  return a.flat?.().at(0).foo?.().bar;
}