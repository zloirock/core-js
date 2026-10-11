// A destructuring assignment whose value is read yields its right side, so no mirror may replace it:
// an array level takes the ordered capture instead - the right captured once and kept as the result,
// each element read in turn, the claim written in its source slot.
let at, first, groupBy, includes;
export const viaInstance = ([{ at }] = [[1, 2]]);
export const viaStatic = ([first, { groupBy }] = [use(), Map]);
export const viaKeyedLevel = ({ W: [{ includes }] } = { W: [[3]] });
export { at, first, groupBy, includes };
