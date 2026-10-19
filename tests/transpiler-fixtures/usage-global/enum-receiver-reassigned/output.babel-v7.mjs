import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Replacing the enum object loses the receiver proof.
enum E {
  at = "at",
}
// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test
E = other;
use(E.at);