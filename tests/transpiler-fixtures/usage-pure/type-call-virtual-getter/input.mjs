// Invoking an annotated getter's result follows its callable contract.
class Field {
  get value(): () => string | number[] { return () => 'ab'; }
}
export function last(field: Field) {
  return field.value().at(-1);
}
