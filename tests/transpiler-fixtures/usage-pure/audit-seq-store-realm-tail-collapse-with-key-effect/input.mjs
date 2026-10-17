// a kept WRITE the source reads through an enclosing SEQUENCE takes the same collapse as the write
// read directly: the sequence hands its tail on, so the realm hop above it reads the value that
// write stored. the `?.` there guards the always-defined store and is dead, the tail folds, and the
// base is the ROOT binding the collapse landed - the sequence prefix re-emits where the source ran it
let v, out;
function eff() {}
// a stored value carrying EFFECTS of its own keeps the store as the read - the source sequence is
// what runs them, and re-reading a base beside it would spell that run a second time. the realm hop
// above still folds: the store hands its value on, and the dropped hop's `?.` slides one member up
let g3;
export const withKeyEffect = (g3 = globalThis, v = g3[(eff(), 'window')].self)?.window.noSuchStatic;
export { v };
