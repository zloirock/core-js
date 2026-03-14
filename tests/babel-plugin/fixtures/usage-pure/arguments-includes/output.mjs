import _includesInstanceProperty from "@core-js/pure/actual/instance/includes";
function foo() {
  return _includesInstanceProperty(arguments).call(arguments, 1);
}