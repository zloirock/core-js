// A user object the receiver walk resolves through its own keys is a mirror root exactly as a pristine proxy global is, under keys
// naming no constructor too: the effect-keyed pattern renders ONCE, off the ponyfills.
let hits = 0;
const src = { Object, Array };
let bind, from;
({ Object: { keys: { [(hits++, 'bind')]: bind } }, Array: { [(hits++, 'from')]: from } } = src);
export const mirrored = [typeof bind, typeof from, hits];
