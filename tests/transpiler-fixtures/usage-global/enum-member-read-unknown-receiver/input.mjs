// Replacing the value preserves the enum object and its own member; no instance helper is needed.
enum E {
  at = "at"
}
E.at = other;
use(E.at);
