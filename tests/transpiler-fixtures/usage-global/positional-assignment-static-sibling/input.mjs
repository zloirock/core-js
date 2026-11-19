// A positional capture keeps the preceding static claim live at its replacement path.
const array = [2, 7], rows = [Object, array];
let keys, at;
[{ keys }, { at }] = rows;
export const result = [keys({ x: 1 }), at.call(array, -1)];
