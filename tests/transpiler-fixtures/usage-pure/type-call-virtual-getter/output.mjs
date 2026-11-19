import _at from "@core-js/pure/actual/instance/at";
// Invoking an annotated getter's result follows its callable contract.
class Field {
  get value(): () => string | number[] {
    return () => 'ab';
  }
}
export function last(field: Field) {
  var _ref;
  return _at(_ref = field.value()).call(_ref, -1);
}