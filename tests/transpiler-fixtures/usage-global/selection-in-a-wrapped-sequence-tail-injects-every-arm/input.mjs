// a selection standing in the tail of a sequence under a wrapper of its own - parens a parser keeps, or a TS cast -
// is the selection the destructure reads: every arm's static is injected, flat, through an array wrapper's slot
// and through a hop's slot alike
const { groupBy } = (init(), (c ? Map : Object));
const { from } = (init(), (c ? Array : Iterator) as any);
const [{ of }] = [(init(), (c ? Array : Int8Array))];
const [{ fromEntries }] = [(init(), (c ? Map : Object) satisfies object)];
const { W: { hasOwn } } = { W: (init(), (c ? Reflect : Object)) };
const { W: { entries } } = { W: (init(), (c ? Reflect : Object)!) };
export { groupBy, from, of, fromEntries, hasOwn, entries };
