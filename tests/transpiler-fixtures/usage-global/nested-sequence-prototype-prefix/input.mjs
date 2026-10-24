// Nested sequence prefixes run before the prototype method is read.
// Every effect survives the extraction, including the inner sequence.
const { prototype: { at: method } } = (outer(), (inner(), Array));
use(method);
