// An iterator claim and a plain slot, each keyed by an effect, in a loop head over a realm selection: the
// iterator key loads its symbol beside both realm roots, the plain one nothing.
let done;
for (const { [(k(), Symbol.iterator)]: it5, [(k2(), 'x')]: x5 } = c ? globalThis : self; !done;) done = 1;
