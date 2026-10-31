import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A bodyless declaration retains every nested sequence prefix before its prototype read.
// The prefixes run once before the instance dispatch; global mode keeps the source.
if (flag) var at = _atMaybeArray((outer(), inner(), Array.prototype));
use(at);