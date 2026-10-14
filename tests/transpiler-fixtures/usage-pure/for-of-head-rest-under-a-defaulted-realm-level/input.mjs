// A for-of head reading the realm through a defaulted level with a rest relocates into the body: the level
// keeps its default, an empty pattern keeps the destructure's throw, and the claim writes ahead of the rest
// copy.
let from2, r2;
for ({ Array: { from: from2, ...r2 } = {} } of [globalThis]);
