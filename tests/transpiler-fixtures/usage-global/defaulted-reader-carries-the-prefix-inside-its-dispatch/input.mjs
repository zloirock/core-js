// a sole reader over a sequence init carries the prefix inside its dispatch even where a DEFAULT wraps
// the read, and a computed key's own sequence runs once, ahead of the one read the extraction performs
const o = { get arr() { log(); return [1, 2]; } };
let at1;
({ at: at1 = 1 } = (eff(), o.arr));
let flat2;
({ flat: flat2 } = (eff(), o[(k++, 'arr')]));
use(at1, flat2);
