// TS interface declaration creates a scope binding even though it is erased at runtime.
// the injector cannot distinguish runtime from type-only bindings during pre-traversal,
// so the interface name reserves the slot and ref allocation skips to the next available
interface _ref { x: number }
function fn(value: _ref = ([].at(0) as any)) { return value; }
console.log(fn());
