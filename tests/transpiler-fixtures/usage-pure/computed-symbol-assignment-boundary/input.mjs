// A computed Symbol.iterator key retains its own extraction path under a constructor.
// The ordinary instance capture must not replace that path; the key effect runs once.
let method;
({ Set: { [(effect(), Symbol.iterator)]: method } } = globalThis);
use(method);
