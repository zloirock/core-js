// A module binding written by a function needs the same capture as a live import.
// Joining adjacent declarators must not drop its instance polyfill.
let rows = [];
export function rebind(value) { rows = value; }
const before = note('before'), { y: { 0: { first } = {}, at } } = { y: rows };
use(first, at);
