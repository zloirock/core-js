import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A local function returning a key keeps the literal's field precise.
class Box {
  static {
    var _ref;
    function key() {
      return 'name';
    }
    const object = {
      [key()]: 'alice'
    };
    _atMaybeString(_ref = object.name).call(_ref, -1);
  }
}