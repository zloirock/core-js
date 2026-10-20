import _at from "@core-js/pure/actual/instance/at";
// Each field evaluation owns the receiver captured before the computed key.
// Re-entry cannot replace the outer invocation's receiver.
export function read(get, key, argument) {
  return new class {
    value = (() => {
      var _ref;
      return _ref = get(), key(), (_at(_ref) || 0).call(_ref, argument());
    })();
  }().value;
}