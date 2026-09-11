// an untouched leading statement anchors the comments below: every row here is consumed,
// and a removed first statement would carry its leading comment down to the next one
const anchor = [1, 2];
export { anchor };

// a SOURCE declarator ahead of the wrap pins the memo: hoisting the element read above `eff()`
// would run it before an effect native performs first
const q = eff(), [{ at, keys }] = [pick()];
export { q, at, keys };

// ... and a plain declarator AFTER the wrap keeps its own slot in the split
const [{ at: at2, keys: keys2 }] = [c ? arr : other], z = at2;
export { at2, keys2, z };

// TWO wrapped declarators share one declaration: each is its own verdict, and neither residual
// survives to read the other's element
const [{ at: at3 }] = [c ? arr : o1], [{ keys: keys3 }] = [c ? arr : o2];
export { at3, keys3 };

// a SURVIVING prop keeps the residual, and the extraction still lands BEFORE it - the shape the
// flat channel emits for the same receiver, whatever order the pattern spells the props in
const [{ at: at4, other: other4 }] = [c ? arr : o3];
export { at4, other4 };

// a loop header has no statement list to spread declarators into, so the up-front elimination
// declines and the extraction binds as a trailing sibling - the post-traverse prune still empties
// the residual, which binds nothing over a pure literal wherever it stands
for (const i = 0, [{ at: at5 }] = [arr]; cond;) log(i, at5);
