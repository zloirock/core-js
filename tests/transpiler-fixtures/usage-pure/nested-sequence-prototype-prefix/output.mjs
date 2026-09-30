import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Nested sequence prefixes run before the prototype method is read.
// Every effect survives the extraction, including the inner sequence.
const method = _atMaybeArray((outer(), inner(), Array.prototype));
use(method);