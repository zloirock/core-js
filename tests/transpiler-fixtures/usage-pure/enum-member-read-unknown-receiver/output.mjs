// Replacing the value preserves the enum object and its own member; no instance helper is needed.
enum E {
  at = "at"
}
// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test
E.at = other;
use(E.at);