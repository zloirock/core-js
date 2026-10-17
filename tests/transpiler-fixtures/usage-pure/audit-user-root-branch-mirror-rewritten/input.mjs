// A user object the receiver walk resolves through its own keys is a mirror root exactly as a pristine proxy global is, under keys
// naming no constructor too: the effect-keyed pattern renders ONCE, off the ponyfills.
let hits = 0;
let moved = { Object, Array };
moved = { Object: { keys: () => 'user' }, Array: { from: () => 'user' } };
let movedBind, movedFrom;
({ Object: { keys: { [(hits++, 'bind')]: movedBind } }, Array: { [(hits++, 'from')]: movedFrom } } = moved);
export const rewritten = [typeof movedBind, movedFrom()];
