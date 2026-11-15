import _at from "@core-js/pure/actual/instance/at";
// An annotated receiver may dispatch to a subclass returning another family.
class Field {
  value(): string | number[] {
    return 'ab';
  }
}
export function last(field: Field) {
  var _ref;
  return _at(_ref = field.value()).call(_ref, -1);
}