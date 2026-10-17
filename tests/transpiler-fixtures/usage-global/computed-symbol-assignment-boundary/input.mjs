// A computed Symbol.iterator slot stays native under a constructor; its key effect runs once.
let method;
({ Set: { [(effect(), Symbol.iterator)]: method } } = globalThis);
use(method);
