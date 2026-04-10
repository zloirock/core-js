var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
try {
  doSomething();
} catch (e: Error) {
  _atMaybeString(_ref = e.message).call(_ref, 0);
}