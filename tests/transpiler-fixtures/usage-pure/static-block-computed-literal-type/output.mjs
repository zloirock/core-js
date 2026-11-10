import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// The key is resolved where the literal is built.
class Box {
  static {
    const key = 'name';
    const object = {
      [key]: 'alice'
    };
    {
      var _ref;
      const key = 'other';
      _atMaybeString(_ref = object.name).call(_ref, -1);
    }
  }
}