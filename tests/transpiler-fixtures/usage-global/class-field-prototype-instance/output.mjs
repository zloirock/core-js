import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// An unchanged static data field carries its constructor identity through prototype.
// The nested and member spellings select the same instance family.
class Box {
  static C = String;
}
use(Box.C.prototype.at);
const {
  C: {
    prototype: {
      includes
    }
  }
} = Box;
use(includes);