// a binding whose value may be a KNOWN CONSTRUCTOR is clouded: the guard channel owns its STATIC
// surface, because which object it holds decides which statics exist. an INSTANCE claim asks
// nothing of that - it reads off whatever the value turns out to be - so it takes the ordinary
// dispatch, the same one the member spelling of the read takes
const seen = [];
for (const ctor of [Array]) {
  const { name } = ctor;
  const { at } = ctor;
  seen.push(name, typeof at);
}
// the STATIC surface of the same binding stays with the guard: it picks the ponyfill on the
// iteration where the value IS the constructor, and reads the slot on any other
for (const ctor of [Array]) {
  const { from } = ctor;
  seen.push(typeof from);
}
// both spellings of one read agree - the member form was never gated on the binding's cloud
for (const ctor of [Array]) {
  seen.push(ctor.name, typeof ctor.from);
}
export { seen };
