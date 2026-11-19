// A pattern still owes the read through an alias under nested stores.
const held = globalThis.window;
let first, second;
const { of } = (first = second = held).self.Array;
of(1);
