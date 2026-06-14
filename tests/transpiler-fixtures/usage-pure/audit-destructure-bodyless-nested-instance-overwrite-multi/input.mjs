// the bodyless-control nested-instance overwrite generalizes past `if` to loop bodies (block-wrapped so
// it stays per-iteration), and a multi-element pattern emits its overwrites in SOURCE order into the one
// block so the LAST element wins for a shared target - as native destructuring does. a per-element insert
// that reversed them would pick the first element's value
let single;
let shared;
for (const x of xs) [{ flat: single }] = [a];
if (cond) [{ flatMap: shared }, { at: shared }] = [b, c];
export { single, shared };
