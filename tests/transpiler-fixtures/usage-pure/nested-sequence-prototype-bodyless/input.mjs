// A bodyless declaration retains every nested sequence prefix before its prototype read.
// The prefixes run once before the instance dispatch; global mode keeps the source.
if (flag) var { prototype: { at } } = (outer(), (inner(), Array));
use(at);
