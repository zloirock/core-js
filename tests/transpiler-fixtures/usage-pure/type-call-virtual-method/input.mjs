// An annotated receiver may dispatch to a subclass returning another family.
class Field {
  value(): string | number[] { return 'ab'; }
}
export function last(field: Field) {
  return field.value().at(-1);
}
