import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// an untouched leading statement anchors the comments below: every row here is consumed,
// and a removed first statement would carry its leading comment down to the next one
const anchor = [1, 2];
export { anchor };

// a SOURCE declarator ahead of the wrap pins the memo: hoisting the element read above `eff()`
// would run it before an effect native performs first
const q = eff();
const _ref = pick();
const at = _at(_ref);
const keys = _keys(_ref);
export { q, at, keys };

// ... and a plain declarator AFTER the wrap keeps its own slot in the split
const _ref2 = c ? arr : other;
const at2 = _at(_ref2);
const keys2 = _keys(_ref2);
const z = at2;
export { at2, keys2, z };

// TWO wrapped declarators share one declaration: each is its own verdict, and neither residual
// survives to read the other's element
const at3 = _at(c ? arr : o1);
const keys3 = _keys(c ? arr : o2);
export { at3, keys3 };

// a SURVIVING prop keeps the residual, and the extraction still lands BEFORE it - the shape the
// flat channel emits for the same receiver, whatever order the pattern spells the props in
const _ref3 = c ? arr : o3;
const at4 = _at(_ref3);
const [{
  other: other4
}] = [_ref3];
export { at4, other4 };

// a loop header has no statement list to spread declarators into, so the up-front elimination
// declines and the extraction binds as a trailing sibling - the post-traverse prune still empties
// the residual, which binds nothing over a pure literal wherever it stands
for (const i = 0, at5 = _at(arr); cond;) log(i, at5);