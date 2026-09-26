// An unproven global key prevents a receiver mirror. Each named static is guarded
// against the selected constructor, and the key retains its global polyfill.
const cond = true;
const { from, [Set]: ctor } = cond ? Array : Iterator;
from([1, 2, 3]);
ctor;
