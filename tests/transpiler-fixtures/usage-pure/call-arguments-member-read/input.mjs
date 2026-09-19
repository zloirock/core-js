// All calls supply Reflect, and the parameter reads only ownKeys.
// Attribute that static without widening the namespace to its other methods.
function read(strings, namespace) { return namespace.ownKeys({ value: 1 }); }
read([""], Reflect);
