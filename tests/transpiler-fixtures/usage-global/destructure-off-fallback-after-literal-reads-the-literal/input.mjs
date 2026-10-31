// A `||` whose left yields an array literal never runs its right, whether the literal is written there
// or an `&&` the build decides yields it. A destructure off the selection reads the literal's own
// slots: a method several types carry loads the array's module alone, the right's value adding none
export const { at } = typeof Set != 'undefined' && [1] || defaults;
export const { includes } = [2] || defaults;
