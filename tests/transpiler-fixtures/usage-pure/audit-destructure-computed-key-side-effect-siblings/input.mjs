// A polyfilled static key is surrounded by effectful computed siblings.
// Key effects and sibling reads stay in source order, the source receiver is shared,
// and every original binding remains present.
const { [(before(), 'x')]: x, [(effectful(), 'from')]: f, [(after(), 'y')]: y } = Array;
const doubled = [1, [2]].flat();
