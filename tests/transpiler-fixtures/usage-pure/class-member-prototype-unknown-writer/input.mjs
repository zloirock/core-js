// A written static slot or escaping class cannot retain its initializer constructor proof.
// Instance reads through prototype keep the generic helpers.
class Written {
  static C = Array;
}
Written.C = other;
use(Written.C.prototype.at);
class Escaped {
  static get C() {
    return String;
  }
}
mutate(Escaped);
use(Escaped.C.prototype.includes);
