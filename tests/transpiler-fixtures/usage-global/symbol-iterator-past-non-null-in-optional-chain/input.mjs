// A `!` on the receiver inside an open chain hides nothing from usage detection of a Symbol.iterator lookup
// called off it: the lookup pulls the iterator modules as it would without the assertion.
// One form per fixture: every receiver form loads this same module set, so a second row would mask the first.
declare const strs: string[] | null;
strs?.at(-1)![Symbol.iterator]().next();
