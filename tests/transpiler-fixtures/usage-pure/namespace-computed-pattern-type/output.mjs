import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Namespace-local computed keys retain their string receiver type.
namespace Box {
  const key = 'name';
  const {
    [key]: value
  } = {
    name: 'alice'
  };
  _atMaybeString(value).call(value, -1);
}