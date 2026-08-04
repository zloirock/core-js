// a SEQUENCE evaluates to its last element, so a probe nav sitting there is the receiver's value
// and owes the guard render. the text emitter builds such a receiver with the chain ROOT already
// substituted, which leaves the nav's own rewrite looking for a needle whose head token was
// renamed - locating it by that token rather than skipping it as a phantom is what keeps the
// ponyfillable hop off a native read here
globalThis.seqBox = { list: ['ab', 'cd'], n: 7 };
export const seqValue = ('x', globalThis.window?.self.seqBox.n);
export const seqMember = ('x', globalThis.window?.self.seqBox).n;
export const seqLeading = (globalThis.window?.self.seqBox.n, 'x');
export const seqOptionalDispatch = ('x', globalThis.window?.self.seqBox.list)?.at(0);
export const seqMemberDispatch = ('x', globalThis.window?.self.seqBox).list?.at(0);
export const seqLeafDispatch = ('x', globalThis.window?.self).seqBox.list?.at(0);

// a PLAIN dispatch over the same receiver reaches the render through another path - the negative
// that pins the optional one as the discriminator
export const seqPlainDispatch = ('x', globalThis.window?.self.seqBox.list).at(0);
export const seqInnerDispatch = ('x', globalThis.window?.self.seqBox.list.at(0));

// a root whose EFFECT the guard test carries, inside the same sequence: the emitter spells that
// receiver with the root resolved AND its proven `?.` dropped, so the nav's own rewrite has to be
// recognised through both spellings rather than by a raw source match
const cr = () => globalThis;
let held;
export const seqCallRootDispatch = ('x', cr().window?.self.seqBox.list)?.at(0);
export const seqAssignRootDispatch = ('x', (held = globalThis)?.window?.self.seqBox.list)?.at(0);
export const seqAssignRootMember = ('x', (held = globalThis)?.window?.self.seqBox).list?.at(0);
export const seqAssignRootLeaf = ('x', (held = globalThis)?.window?.self).seqBox.list?.at(0);
export { held };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.seqBox.list ? 0 : 1)?.includes('a');
