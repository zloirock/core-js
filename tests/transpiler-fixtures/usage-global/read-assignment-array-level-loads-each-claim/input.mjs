// A destructuring assignment whose value is read still reads each claim off its element: an array level
// loads the instance method and the static its slots name, flat or under a keyed level.
let at, first, groupBy, includes;
export const viaInstance = ([{ at }] = [[1, 2]]);
export const viaStatic = ([first, { groupBy }] = [use(), Map]);
export const viaKeyedLevel = ({ W: [{ includes }] } = { W: [[3]] });
export { at, first, groupBy, includes };
