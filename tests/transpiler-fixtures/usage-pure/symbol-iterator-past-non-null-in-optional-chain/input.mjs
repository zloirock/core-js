// A `!` inside an open chain continues it into a Symbol.iterator lookup: the receiver's `?.` guards
// the iterator helper and the links after it, whether the assertion stands on the receiver or
// between the lookup and its call. Parens around the chain still seal it: the helper reads the
// short-circuit's value and throws on it as the source does.
declare const strs: string[] | null;
strs?.at(-1)![Symbol.iterator]().next();
strs?.[0]!![Symbol.iterator];
strs?.[Symbol.iterator]!().next();
(strs?.[2])![Symbol.iterator]().next();
(strs?.[3]![Symbol.iterator])();
