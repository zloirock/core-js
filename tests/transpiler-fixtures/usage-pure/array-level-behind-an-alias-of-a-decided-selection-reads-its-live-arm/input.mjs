// an array level reached through a const alias of a selection the build decides reads the arm it always
// yields, as the selection spelled in place does - off a ternary and, a level deeper, off an `&&`
const pair = typeof Symbol != 'undefined' ? [Map] : [Object];
const [{ groupBy }] = pair;
const nested = typeof Symbol != 'undefined' && [{ C: Array }];
const [{ C: { of } }] = nested;
export { groupBy, of };
