// An effectful call returning the realm keeps one shared initializer for nested readers.
function getRealm() { return globalThis; }
const { Array: { prototype: { flat }, isArray } } = (effect(), getRealm());
use(flat, isArray);
