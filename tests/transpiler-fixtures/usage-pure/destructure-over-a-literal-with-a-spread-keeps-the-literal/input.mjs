// A claim reading a value-selecting slot of a literal init consumes the declarator only where the slot
// performs every effect the init would: a spread beside it reads its source, so the literal stays.
export const { w: { at: a } } = { ...spread, w: c ? [1] : [2] };
export const { v: { flat: b } } = { ...other, v: [1] };
