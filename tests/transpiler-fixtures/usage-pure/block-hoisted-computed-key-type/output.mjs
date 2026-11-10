import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A var key is visible after its declaring block.
function read() {
  var _ref;
  {
    var key = 'name';
  }
  const object = {
    [key]: 'alice'
  };
  return _atMaybeString(_ref = object.name).call(_ref, -1);
}