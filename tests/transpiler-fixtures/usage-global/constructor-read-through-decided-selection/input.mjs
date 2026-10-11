// A constructor read through a selection this build decides is the operand it yields: a `new`, a
// static call and an `instanceof` over it type their result or narrow their receiver by that
// constructor alone. An undecided selection keeps both.
export const made = new (typeof Promise != 'undefined' ? Array : String)().at(0);

export const converted = (typeof Promise != 'undefined' ? Array : Object).from(input).includes(1);

export function narrowed(value) {
  if (value instanceof (typeof Promise != 'undefined' ? String : Array)) return value.concat('d');
}

export const undecided = new (globalThis.flag ? Array : String)().slice(1);
