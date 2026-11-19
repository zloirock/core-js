// an array pattern assigned in value position over a selection the build decides behind an effect
// prefix: the element reads off the array the selection yields, as for that array spelled alone
var groupBy, from, at;
export const grouped = () => ([{ groupBy }] = (eff(), typeof Symbol != 'undefined' ? [Map] : [Object]));
export const listed = () => ([, { from }] = (eff(), typeof Symbol != 'undefined' && [0, Array]));
export const picked = () => ([{ at }] = (eff(), [[1]] || [user]));
