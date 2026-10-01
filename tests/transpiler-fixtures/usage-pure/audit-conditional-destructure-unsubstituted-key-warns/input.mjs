// An unbound computed key stays in the native pattern and may still throw.
// The preceding named static is guarded against the selected constructor.
const cond = true;
const { from, [appProvidedKey]: ctor } = cond ? Array : Iterator;
from([1, 2, 3]);
ctor;
