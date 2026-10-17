// Replacing the enum object loses the receiver proof.
enum E {
  at = "at"
}
E = other;
use(E.at);
