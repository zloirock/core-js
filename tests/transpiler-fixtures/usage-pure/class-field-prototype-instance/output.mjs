import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// An unchanged static data field carries its constructor identity through prototype.
// The nested and member spellings select the same instance family.
class Box {
  static C = String;
}
use(_atMaybeString(Box.C.prototype));
const includes = _includesMaybeString(Box.C.prototype);
use(includes);