// An effectful call returning the realm keeps one shared initializer for nested readers.
function getRealm() { effect(); return globalThis; }
const { Array: { prototype: { flat }, isArray } } = getRealm();
use(flat, isArray);
