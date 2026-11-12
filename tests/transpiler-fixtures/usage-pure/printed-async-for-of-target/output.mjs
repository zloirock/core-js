import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Parentheses distinguish an async-named target from an async function head.
let async;
for ((async) of [7]) {
  var _ref;
  console.log(_atMaybeArray(_ref = [async]).call(_ref, 0));
}