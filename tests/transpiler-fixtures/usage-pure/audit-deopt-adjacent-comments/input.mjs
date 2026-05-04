// adjacent block comments between `?.` and the call/bracket: the helper must consume
// each comment in turn and look at the structural next token. each line uses a
// different polyfilled method to make the per-line resolution visible: at / flatMap /
// includes
const a = arr?./* a *//* b */at(0);
const b = arr?./* a *//* b */flatMap(_ => [_]);
const c = arr?./* a *//* b */includes(1);
