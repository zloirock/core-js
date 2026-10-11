// a computed key consuming the whole declaration runs its effect after the init's: the effect prefix of
// the operand the build decides runs first, where the source ran it
export const log = [];
export const { [(log.push('key'), 'from')]: from } = typeof Symbol != 'undefined' ? (log.push('init'), Iterator) : Object;
