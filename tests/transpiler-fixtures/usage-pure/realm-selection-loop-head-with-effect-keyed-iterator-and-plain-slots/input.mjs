// An iterator claim and a plain slot, each keyed by an effect, in a loop head over a realm selection: both
// legs run the keys in source order around the claim's binding, babel reading the realm again for each part
// while unplugin's drain memoizes it (the sidecar).
let done;
for (const { [(k(), Symbol.iterator)]: it5, [(k2(), 'x')]: x5 } = c ? globalThis : self; !done;) done = 1;
