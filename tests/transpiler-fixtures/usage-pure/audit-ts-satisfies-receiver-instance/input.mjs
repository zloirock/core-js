// TS `satisfies` cast on a receiver feeding an instance call: the cast is peeled and
// the call recognised as a polyfill site.
(arr satisfies number[]).includes(1);
(arr satisfies number[]).at(-1);
