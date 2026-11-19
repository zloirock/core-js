// A bound array default remains a receiver fact for the next nested destructuring.
// A present receiver must receive the polyfills even when its sibling default stays dead.
const { x = [5, [6]] } = {};
const { w: { at, flat } = [1, [2]] } = { w: x };
