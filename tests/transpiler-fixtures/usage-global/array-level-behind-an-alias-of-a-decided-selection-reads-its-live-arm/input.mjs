// an array level reached through a const alias of a selection the build decides reads the arm it always
// yields, as the selection spelled in place does - in a declaration and in an assignment
const pair = typeof Symbol != 'undefined' ? [Map] : [Object];
const [{ groupBy }] = pair;
const nested = typeof Symbol != 'undefined' && [{ C: Array }];
let of;
[{ C: { of } }] = nested;
export { groupBy, of };
