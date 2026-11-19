// A sequence prefix runs once in the environment probe. An instance consumer
// captures that receiver before dispatch; a terminal realm claim keeps the same
// sequence in its test. Both hosts preserve the source order and guard.
let c = 0;
function a() {}
export const instanceTail = (c++, globalThis.window)?.self.Array.name;
export const plainTail = (c++, globalThis.window)?.self.foo;
export const nestedSequence = (a(), (c++, globalThis.window))?.self.Array.name;
// ... and the prefix already standing INSIDE the probe hop, which must not be re-emitted beside it
export const prefixUnderTheProbe = (c++, globalThis).window?.self.Array.name;
// controls
export const terminalNav = (c++, globalThis.window)?.self;
export const deadPrefix = (0, globalThis.window)?.self.Array.name;
export const noSequence = globalThis.window?.self.Array.name;
export { c };
