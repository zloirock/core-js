// A `||` whose left yields an array literal never runs its right, whether the literal is written there
// or an `&&` the build decides yields it, held in a const. A destructure off the selection reads the
// literal's own slots: a method several types carry takes the array's polyfill, not the generic one
const list = typeof Set != 'undefined' && [1] || defaults;
export const { at } = list;
export const { includes } = [2] || defaults;
