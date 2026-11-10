import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
function convert() {
  return 'abc';
}
function read(value = convert()) {
  function convert() {
    return [1];
  }
  return _includesMaybeString(value).call(value, 'bc');
}
read();