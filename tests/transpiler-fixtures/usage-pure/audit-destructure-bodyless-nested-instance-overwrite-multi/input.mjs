// Bodyless loop and conditional assignments keep their RHS evaluations and method reads inside the
// controlled body. Multiple reads write in source order, so the last one wins for a shared target.
let single;
let shared;
for (const x of xs) [{ flat: single }] = [a];
if (cond) [{ flatMap: shared }, { at: shared }] = [b, c];
export { single, shared };
