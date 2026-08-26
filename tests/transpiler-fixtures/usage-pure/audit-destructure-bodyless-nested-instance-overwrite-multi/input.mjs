// the bodyless-control nested-instance overwrite generalizes past `if` to loop bodies, where a SOLE
// consumed slot leaves the dispatch alone in the slot (nothing to brace) and a MULTI-element pattern
// keeps its destructure - its siblings still bind - so that one takes a block, emitting the
// overwrites in SOURCE order so the LAST element wins for a shared target, as native destructuring
// does. a per-element insert that reversed them would pick the first element's value
let single;
let shared;
for (const x of xs) [{ flat: single }] = [a];
if (cond) [{ flatMap: shared }, { at: shared }] = [b, c];
export { single, shared };
