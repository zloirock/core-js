// a computed key consuming the whole declaration over a selection the build decides reads as over the
// operand that runs: a bare binding is read in place, and a decided `&&` yields its right as a ternary does
export const log = [];
export const { [(log.push('of'), 'of')]: of } = typeof Symbol != 'undefined' ? Array : Object;
export const { [(log.push('try'), 'try')]: attempt } = typeof Symbol != 'undefined' && (log.push('init'), Promise);
