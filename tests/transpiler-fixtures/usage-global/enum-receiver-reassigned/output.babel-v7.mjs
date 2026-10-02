import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Replacing the enum object loses the receiver proof.
enum E {
  at = "at",
}
E = other;
use(E.at);