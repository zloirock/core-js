// Both var redeclarations keep their native destructuring when the binding is unused.
var [{ JSON: VR }] = [globalThis];
var [{ Math: VR }] = [globalThis];
