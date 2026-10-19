import _atMaybeString from "@core-js/pure/actual/string/instance/at";
try {
  doSomething();
  // @ts-expect-error a catch annotation tsc refuses is the shape under test
} catch (e: Error) {
  var _ref;
  _atMaybeString(_ref = e.message).call(_ref, 0);
}