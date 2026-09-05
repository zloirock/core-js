// nested instance dispatch: an inner instance-GET (`.name` / `.flags`) buried in the receiver of an
// outer instance dispatch on a polyfillable-global chain - the outer receiver collapse must stay
// composable with the inner rewrite (this class used to crash the build or silently drop the inner)
export const callOverGet = globalThis?.foo.name.at(0);
export const plainRoot = globalThis.bar.name.includes('x');
export const ctorRoot = Promise?.foo.name.at(-1);
export const hopRoot = globalThis?.self.foo.flags.at(0);
export const getOverGet = globalThis?.foo.flags.name;
export const protoChain = globalThis.self.Array.prototype.at.name;
export const wrapped = (globalThis.self).Array.prototype.includes.name;
export const doubleNested = globalThis.foo.flags.name.at(0);
export const iifeRoot = (() => globalThis)()?.foo.name.at(0);
// call-rooted guard memo: the root's inner proxy global substitutes INSIDE the guard text, and a
// claimable static method in the tail keeps its live claim (the root nav resolves through the call)
export const iifeCallTail = (() => globalThis)()?.self.Array.from([1]).at(0);
export const iifeTriple = (() => globalThis)()?.self.Array.prototype.includes.name.at(0);
// optional on a MID hop (root itself not optional): the guard memoizes the chain root and the
// receiver leaf's substitution must survive a reused override to reach the guard text
export const midHopOptional = globalThis.baz?.name.includes('z');
// controls: a plain-object receiver and an inner instance-CALL keep their existing shapes
export const objControl = obj?.foo.name.at(0);
export const innerCallControl = globalThis?.foo.at(0).includes('a');
