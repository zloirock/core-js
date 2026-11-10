import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A static block's key must not shadow the later outside read.
const key = 'name';
class Box {
  static {
    const key = 'other';
  }
}
const object = {
  [key]: 'alice',
  other: []
};
_atMaybeString(_ref = object.name).call(_ref, -1);