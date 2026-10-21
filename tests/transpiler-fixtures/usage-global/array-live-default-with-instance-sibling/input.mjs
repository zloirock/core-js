// A live receiver default retains its native read beside an independently polyfilled instance leaf.
const [{ isArray } = Array, { at }] = [undefined, [7, 8]];
export const result = [isArray([]), at.call([7, 8], -1)];
