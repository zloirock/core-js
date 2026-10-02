import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An unknown consumer may change the enum object and its prototype.
enum E {
  at = "at",
}
mutate(E);
use(E.at);