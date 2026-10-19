// the global counterpart: the pattern stays as written, so its bindings never leave the scope, and
// each later read takes the family of the write before it - an array for one, a string for the other
let [{ w: { values } }] = r;
values = [1, 2];
export const a = values.at(0);
let [{ v: { keys } }] = s;
keys = 'text';
export const b = keys.includes('x');
