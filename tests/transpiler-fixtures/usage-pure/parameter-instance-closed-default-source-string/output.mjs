import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A private parameter keeps its closed default receiver fact after body-entry capture.
// This isolated row must import only the String.at family.
const source = 'ab';
{
  function read(_ref = source) {
    let at = _atMaybeString(_ref);
    return at;
  }
}