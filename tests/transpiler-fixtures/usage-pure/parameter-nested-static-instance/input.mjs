// A nested instance read keeps the outer static before the default parameter is mirrored.
function read({ Array: { of: { name } } } = globalThis) { return name; }
read();
