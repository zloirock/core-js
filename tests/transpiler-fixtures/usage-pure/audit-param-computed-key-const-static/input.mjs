// A constant computed key in a parameter destructure default (`{ [k]: of } = Array`) resolves the
// key to the static method and substitutes the binding
const k = 'of';
(({ [k]: of } = Array) => of([1]))();
