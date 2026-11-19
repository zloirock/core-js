// Member assignment targets consume their actual literal-container property values.
// Neither all-member nor mixed-member patterns synthesize static imports.
const src = { Object, Array };
const o = {};
({ Array: { from: o.f, of: o.g } } = src);
let values;
({ Object: { entries: o.e, values } } = src);
export { o, values };
