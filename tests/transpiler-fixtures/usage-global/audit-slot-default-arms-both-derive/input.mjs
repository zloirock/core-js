// a DEFAULT on the slot makes the receiver two-armed the same way a ternary does: the slot's own
// value when it is defined, the default's when it is not. the arm that runs exactly when the slot is
// ABSENT has to derive too, so the two types fold - and a cross-family pair collapses to the
// typeless answer both arms can take
const src = { y: 'ab' };
const spare = [1, 2];
const { y: { at } = spare } = src;
use(at);
