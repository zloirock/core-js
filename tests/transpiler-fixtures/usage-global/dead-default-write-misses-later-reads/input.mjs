// A default on a leaf whose static the build serves never runs, so a write in it reaches no later read -
// not one after the declaration, not one after the function the default sits in - and neither read
// loads the string modules the dead write would bring.
let list = [1, 2];
const { from = (list = 'ab', 0) } = Array;
export const last = list.at(-1);
let rows = [3, 4];
(() => { const { of = (rows = 'cd', 0) } = Array; return of; })();
export const found = rows.includes(3);
export const made = from([5]);
