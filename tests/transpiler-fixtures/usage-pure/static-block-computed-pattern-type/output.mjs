import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A key declared in this static block names the string-valued slot.
class Box {
  static {
    const key = 'name';
    const {
      [key]: value
    } = {
      name: 'alice'
    };
    _atMaybeString(value).call(value, -1);
  }
}