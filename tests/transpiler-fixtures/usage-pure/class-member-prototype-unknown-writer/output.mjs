import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A written static slot or escaping class cannot retain its initializer constructor proof.
// Instance reads through prototype keep the generic helpers.
class Written {
  static C = Array;
}
Written.C = other;
use(_at(Written.C.prototype));
class Escaped {
  static get C() {
    return String;
  }
}
mutate(Escaped);
use(_includes(Escaped.C.prototype));