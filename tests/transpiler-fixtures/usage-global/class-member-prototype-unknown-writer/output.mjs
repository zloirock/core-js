import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
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