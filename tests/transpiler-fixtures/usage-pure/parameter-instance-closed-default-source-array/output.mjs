import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A private parameter keeps its closed default receiver fact after body-entry capture.
// This isolated row must import only the Array.at family.
const source = [1, 2];
{
  function read(_ref = source) {
    let at = _atMaybeArray(_ref);
    return at;
  }
}