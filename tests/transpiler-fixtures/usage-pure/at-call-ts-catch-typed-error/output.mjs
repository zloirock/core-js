import _atMaybeString from "@core-js/pure/actual/string/instance/at";
try {
  doSomething();
} catch (e: Error) {
  var _ref;
  _atMaybeString(_ref = e.message).call(_ref, 0);
}