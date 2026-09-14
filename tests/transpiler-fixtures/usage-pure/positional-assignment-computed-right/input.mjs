// An assignment host whose right side the overwrite channel cannot spell - a call, a member chain
// the plugin itself rewrote - still hands its array slots to the positional route: the slot binds a
// minted name and the claim is written right after the statement, in slot order, on both legs.
// The slot's type is the element type the index spelling reads: a call returning a typed array
// dispatches the typed helper, a `map` result (its element type unknown) the generic dispatcher.
const rows = [[1, 2], [3, 4]];
const nested = [[[1, 2]], [[3, 4]]];
const f = () => rows;
const g = () => nested;
let a1, b1, a2, b2, a3, b3, a4;
[{ at: a1 }, { at: b1 }] = f();
[[{ at: a2 }], [{ at: b2 }]] = g();
[{ at: a3 }, { at: b3 }] = rows.map(x => x);
[[{ at: a4 }]] = nested.map(x => x);
export { a1, b1, a2, b2, a3, b3, a4 };
