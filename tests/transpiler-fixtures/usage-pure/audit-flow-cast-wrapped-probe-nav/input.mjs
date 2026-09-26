// a Flow cast is REQUIRED to carry its own parens, so the layer between the probe nav and its tail
// is the cast node itself rather than a paren wrapper - the same absorbed-layer class reached
// through a different node type. the tail keeps the source's PLAIN dereference, which throws where
// the guard answers nullish, and the cast over the LEAF is erased with the node the render replaces
globalThis.flowBox = { list: ['ab', 'cd'], n: 7 };
export const castOverNav = (globalThis.window?.self.flowBox: any).list?.at(0);
export const castOverNavPlain = (globalThis.window?.self.flowBox: any).list;
export const castOverChain = (globalThis.window?.self.flowBox.list: any)?.at(0);
export const castOverLeaf = (globalThis.window?.self: any).flowBox.n;
export const castNested = ((globalThis.window?.self.flowBox: any).list: any[]).at(0);

// the same layer over a CALL and an ASSIGN root: the root effect rides the guard test, and the
// layer must not move where it runs
const cr = () => globalThis;
let held;
export const castOverCallRoot = (cr().window?.self.flowBox: any).list?.at(0);
export const castOverAssignRoot = ((held = globalThis).window?.self.flowBox: any).list?.at(0);
export { held };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.flowBox.list ? 0 : 1)?.includes('a');
