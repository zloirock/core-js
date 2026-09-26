// a module-local object literal narrows its field from the init value ONLY while no channel
// can rewrite the field: an own method assigning `this.<field>` retypes it on ANY later call,
// whether invoked directly or through an extracted function value
const boxed = { data: [1, 2] };
export const viaPlainField = boxed.data.at(0);

const swapped = { data: [3, 4], swap() { this.data = "xy"; } };
swapped.swap();
export const viaMethodWrite = swapped.data.includes(5);

const pulled = { data: [6, 7], flip() { this.data = "z"; } };
const m = pulled.flip;
m.call(pulled);
export const viaExtractedWrite = pulled.data.at(1);
