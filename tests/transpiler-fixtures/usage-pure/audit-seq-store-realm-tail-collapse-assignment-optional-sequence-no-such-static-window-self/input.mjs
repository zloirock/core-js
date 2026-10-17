// a kept WRITE the source reads through an enclosing SEQUENCE takes the same collapse as the write
// read directly: the sequence hands its tail on, so the realm hop above it reads the value that
// write stored. the `?.` there guards the always-defined store and is dead, the tail folds, and the
// base is the ROOT binding the collapse landed - the sequence prefix re-emits where the source ran it
let v, out;
let g1;
out = (g1 = globalThis, v = g1.self)?.window.noSuchStatic;
export { v };
export { out };
