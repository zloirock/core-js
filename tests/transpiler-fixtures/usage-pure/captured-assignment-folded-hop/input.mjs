// A bound hop in a captured array element keeps the method extraction on assignment.
const K = 'row';
const source = [{ row: [3, 7] }];
let at;
[{ [K]: { at } }] = source;
export const result = at.call([3, 7], -1);
